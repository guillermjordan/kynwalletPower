import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TEST_REGISTRATION } from '@/test/fixtures';
import { createRegisterStub } from '@/test/registerStub';
import { RegisterForm } from './RegisterForm';

function setup(stub = createRegisterStub()) {
  const user = userEvent.setup();
  const onRegistered = vi.fn();
  render(<RegisterForm register={stub.register} onRegistered={onRegistered} />);
  const fields = {
    fullName: screen.getByLabelText('Nombre completo'),
    email: screen.getByLabelText('Correo electrónico'),
    password: screen.getByLabelText('Contraseña'),
    confirmation: screen.getByLabelText('Confirmar contraseña'),
    terms: screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
  };
  const fillValid = async () => {
    await user.type(fields.fullName, TEST_REGISTRATION.fullName);
    await user.type(fields.email, TEST_REGISTRATION.email);
    await user.type(fields.password, TEST_REGISTRATION.password);
    await user.type(fields.confirmation, TEST_REGISTRATION.password);
    await user.click(fields.terms);
  };
  const submit = () => user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  return { user, stub, onRegistered, fields, fillValid, submit };
}

describe('RegisterForm · US1 Crear una cuenta con datos válidos', () => {
  it('US1-1: datos válidos y términos → registra y avisa que terminó', async () => {
    const { stub, onRegistered, fillValid, submit } = setup();
    await fillValid();
    await submit();
    expect(stub.register).toHaveBeenCalledWith(TEST_REGISTRATION);
    expect(onRegistered).toHaveBeenCalledOnce();
  });

  it('US1-2: durante la espera el botón está ocupado y no admite reenvíos', async () => {
    const { user, stub, onRegistered, fillValid, submit } = setup();
    stub.defer();
    await fillValid();
    await submit();
    const busy = screen.getByRole('button', { name: 'Creando cuenta…' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    await user.click(busy);
    await user.type(screen.getByLabelText('Nombre completo'), '{Enter}');
    expect(stub.register).toHaveBeenCalledOnce();
    await act(async () => stub.release());
    expect(onRegistered).toHaveBeenCalledOnce();
  });

  it('US1-6: Enter en un campo de texto envía el formulario', async () => {
    const { user, stub, fields, fillValid } = setup();
    await fillValid();
    await user.type(fields.email, '{Enter}');
    expect(stub.register).toHaveBeenCalledOnce();
  });

  it('Caso límite: doble clic en "Crear cuenta" → una sola llamada', async () => {
    const { user, stub, fillValid } = setup();
    stub.defer();
    await fillValid();
    await user.dblClick(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(stub.register).toHaveBeenCalledOnce();
  });

  it('FR-001: título, subtítulo, ejemplos y autocompletado según el frame', () => {
    const { fields } = setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos para comenzar')).toBeInTheDocument();
    expect(fields.fullName).toHaveAttribute('placeholder', 'Ej: Diego Martínez');
    expect(fields.fullName).toHaveAttribute('autocomplete', 'name');
    expect(fields.email).toHaveAttribute('placeholder', 'tucorreo@ejemplo.com');
    expect(fields.email).toHaveAttribute('type', 'email');
    expect(fields.password).toHaveAttribute('autocomplete', 'new-password');
    expect(fields.confirmation).toHaveAttribute('autocomplete', 'new-password');
  });

  it('FR-018: cada contraseña tiene su propio control de visibilidad', async () => {
    const { user, fields } = setup();
    const [first, ...rest] = screen.getAllByRole('button', { name: 'Mostrar contraseña' });
    expect(rest).toHaveLength(1);
    if (first) await user.click(first);
    expect(fields.password).toHaveAttribute('type', 'text');
    expect(fields.confirmation).toHaveAttribute('type', 'password');
  });
});

describe('RegisterForm · US2 Validar los datos en línea', () => {
  it('US2-1: envío vacío → los cinco mensajes, sin registrar y foco en el nombre', async () => {
    const { stub, fields, submit } = setup();
    await submit();
    expect(fields.fullName).toHaveAccessibleDescription('Ingresa tu nombre completo');
    expect(fields.email).toHaveAccessibleDescription('Ingresa tu correo electrónico');
    expect(fields.password).toHaveAccessibleDescription('Ingresa tu contraseña');
    expect(fields.confirmation).toHaveAccessibleDescription('Confirma tu contraseña');
    expect(fields.terms).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
    expect(stub.register).not.toHaveBeenCalled();
    expect(fields.fullName).toHaveFocus();
  });

  it('US2-2: "usuario@" y salir del campo → correo válido', async () => {
    const { user, fields } = setup();
    await user.type(fields.email, 'usuario@');
    await user.tab();
    expect(fields.email).toHaveAccessibleDescription('Ingresa un correo electrónico válido');
  });

  it('US2-3: contraseña de 7 caracteres y salir del campo → mensaje de longitud', async () => {
    const { user, fields } = setup();
    await user.type(fields.password, '1234567');
    await user.tab();
    expect(fields.password).toHaveAccessibleDescription(
      'La contraseña debe tener al menos 8 caracteres',
    );
  });

  it('US2-4 y US2-5: confirmación distinta → no coinciden; al corregir desaparece', async () => {
    const { user, fields } = setup();
    await user.type(fields.password, 'clave-segura-1');
    await user.type(fields.confirmation, 'clave-segura-2');
    await user.tab();
    expect(fields.confirmation).toHaveAccessibleDescription('Las contraseñas no coinciden');
    await user.clear(fields.password);
    await user.type(fields.password, 'clave-segura-2');
    expect(fields.confirmation).not.toHaveAttribute('aria-invalid');
  });

  it('US2-6: un control no tocado no muestra errores', async () => {
    const { user, fields } = setup();
    await user.type(fields.email, 'usuario@');
    expect(fields.fullName).not.toHaveAttribute('aria-invalid');
    expect(fields.email).not.toHaveAttribute('aria-invalid');
  });

  it('US2-8: cada control con error es inválido y describe su mensaje', async () => {
    const { fields, submit } = setup();
    await submit();
    for (const control of Object.values(fields)) {
      expect(control).toHaveAttribute('aria-invalid', 'true');
    }
  });

  it.each([
    ['fullName', 'email'],
    ['email', 'password'],
    ['password', 'confirmation'],
    ['confirmation', 'terms'],
  ] as const)('FR-010: con "%s" válido, el foco va al siguiente error ("%s")', async (_, next) => {
    const { user, fields, submit } = setup();
    const order = ['fullName', 'email', 'password', 'confirmation', 'terms'] as const;
    const values = {
      fullName: TEST_REGISTRATION.fullName,
      email: TEST_REGISTRATION.email,
      password: TEST_REGISTRATION.password,
      confirmation: TEST_REGISTRATION.password,
    };
    for (const field of order.slice(0, order.indexOf(next))) {
      if (field !== 'terms') await user.type(fields[field], values[field]);
    }
    await submit();
    expect(fields[next]).toHaveFocus();
  });

  it('Caso límite: todo válido sin aceptar términos → error en la casilla con el foco', async () => {
    const { user, stub, fields, fillValid, submit } = setup();
    await fillValid();
    await user.click(fields.terms);
    await submit();
    expect(fields.terms).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
    expect(fields.terms).toHaveFocus();
    expect(stub.register).not.toHaveBeenCalled();
  });

  it('Caso límite: nombre y correo solo con espacios se tratan como vacíos', async () => {
    const { user, fields, submit } = setup();
    await user.type(fields.fullName, '   ');
    await user.type(fields.email, '   ');
    await submit();
    expect(fields.fullName).toHaveAccessibleDescription('Ingresa tu nombre completo');
    expect(fields.email).toHaveAccessibleDescription('Ingresa tu correo electrónico');
  });

  it('Caso límite: el texto pegado se valida igual que el escrito', async () => {
    const { user, fields } = setup();
    await user.click(fields.email);
    await user.paste('usuario.com');
    await user.tab();
    expect(fields.email).toHaveAccessibleDescription('Ingresa un correo electrónico válido');
  });

  it.each([
    ['R2-D2', 'Ingresa un nombre válido'],
    ['a'.repeat(81), 'El nombre no puede superar 80 caracteres'],
  ])('FR-004: nombre %j → "%s"', async (name, message) => {
    const { user, fields } = setup();
    await user.click(fields.fullName);
    await user.paste(name);
    await user.tab();
    expect(fields.fullName).toHaveAccessibleDescription(message);
  });
});

describe('RegisterForm · US3 Navegar al inicio de sesión', () => {
  it('FR-016: enlace "Inicia sesión" a /login precedido por "¿Ya tienes cuenta?"', () => {
    setup();
    const link = screen.getByRole('link', { name: 'Inicia sesión' });
    expect(link).toHaveAttribute('href', '/login');
    expect(link.parentElement).toHaveTextContent('¿Ya tienes cuenta?');
  });
});

describe('RegisterForm · US4 Rechazar un correo ya registrado', () => {
  const taken = () => createRegisterStub({ kind: 'email-taken' });

  it('US4-1: muestra el error, no termina el registro y lleva el foco al correo', async () => {
    const { onRegistered, fields, fillValid, submit } = setup(taken());
    await fillValid();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con este correo',
    );
    expect(onRegistered).not.toHaveBeenCalled();
    expect(fields.email).toHaveFocus();
  });

  it('US4-2: conserva nombre y correo, vacía las contraseñas sin errores y el alert se va al editar', async () => {
    const { user, fields, fillValid, submit } = setup(taken());
    await fillValid();
    await submit();
    await screen.findByRole('alert');
    expect(fields.fullName).toHaveValue(TEST_REGISTRATION.fullName);
    expect(fields.email).toHaveValue(TEST_REGISTRATION.email);
    expect(fields.password).toHaveValue('');
    expect(fields.confirmation).toHaveValue('');
    expect(fields.password).not.toHaveAttribute('aria-invalid');
    expect(fields.confirmation).not.toHaveAttribute('aria-invalid');
    await user.type(fields.email, 'x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('FR-023: servicio no disponible → mensaje sin detalles internos', async () => {
    const { fillValid, submit } = setup(createRegisterStub({ kind: 'unavailable' }));
    await fillValid();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Servicio de registro no disponible. Intenta más tarde.',
    );
  });
});

describe('RegisterForm · US6 Opciones aún no disponibles', () => {
  it.each(['Google', 'Apple'])(
    'US6-1: "%s" muestra "Próximamente" y conserva los datos',
    async (provider) => {
      const { user, stub, fields } = setup();
      await user.type(fields.fullName, TEST_REGISTRATION.fullName);
      await user.click(screen.getByRole('button', { name: provider }));
      expect(screen.getByRole('status')).toHaveTextContent('Próximamente');
      expect(fields.fullName).toHaveValue(TEST_REGISTRATION.fullName);
      expect(stub.register).not.toHaveBeenCalled();
    },
  );

  it('US6-2: "términos y condiciones" muestra "Próximamente" sin cambiar la casilla', async () => {
    const { user, fields } = setup();
    await user.click(screen.getByRole('button', { name: 'términos y condiciones' }));
    expect(screen.getByRole('status')).toHaveTextContent('Próximamente');
    expect(fields.terms).not.toBeChecked();
  });

  it('FR-001: separador "o regístrate con"', () => {
    setup();
    expect(screen.getByText('o regístrate con')).toBeInTheDocument();
  });

  it('FR-020: orden de tabulación según contracts/ui-register.md', async () => {
    const { user, fields } = setup();
    const toggles = screen.getAllByRole('button', { name: 'Mostrar contraseña' });
    const expected = [
      fields.fullName,
      fields.email,
      fields.password,
      toggles[0],
      fields.confirmation,
      toggles[1],
      fields.terms,
      screen.getByRole('button', { name: 'términos y condiciones' }),
      screen.getByRole('button', { name: 'Crear cuenta' }),
      screen.getByRole('button', { name: 'Google' }),
      screen.getByRole('button', { name: 'Apple' }),
      screen.getByRole('link', { name: 'Inicia sesión' }),
    ];
    for (const element of expected) {
      await user.tab();
      expect(element).toHaveFocus();
    }
  });
});
