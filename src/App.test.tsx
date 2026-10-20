import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister } from '@/application/register';
import { InMemoryAccounts } from '@/infrastructure/InMemoryAccounts';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from '@/infrastructure/InMemoryRegistrationGateway';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { TEST_ACCOUNT, TEST_REGISTRATION } from '@/test/fixtures';
import { createRegisterStub } from '@/test/registerStub';
import { App } from './App';

const SUCCESS = 'Cuenta creada con éxito. Ya puedes iniciar sesión.';

/** App con stubs (pruebas de pantalla). */
function renderWithStubs() {
  return render(
    <App authenticate={createAuthStub().authenticate} register={createRegisterStub().register} />,
  );
}

/** App con los adaptadores en memoria reales, como en main.tsx (pruebas de punta a punta). */
function renderInMemory() {
  const accounts = new InMemoryAccounts([TEST_ACCOUNT]);
  const authenticate = createAuthenticate(new InMemoryAuthGateway(accounts, { delayMs: 0 }));
  const register = createRegister(new InMemoryRegistrationGateway(accounts, { delayMs: 0 }));
  return render(<App authenticate={authenticate} register={register} />);
}

async function registerAccount(email: string = TEST_REGISTRATION.email) {
  await userEvent.type(screen.getByLabelText('Nombre completo'), TEST_REGISTRATION.fullName);
  await userEvent.type(screen.getByLabelText('Correo electrónico'), email);
  await userEvent.type(screen.getByLabelText('Contraseña'), TEST_REGISTRATION.password);
  await userEvent.type(screen.getByLabelText('Confirmar contraseña'), TEST_REGISTRATION.password);
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
}

async function logIn(email: string, password: string) {
  await userEvent.type(screen.getByLabelText('Correo electrónico'), email);
  await userEvent.type(screen.getByLabelText('Contraseña'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

const goTo = (path: string) => window.history.replaceState(null, '', path);

beforeEach(() => {
  goTo('/login');
});

describe('App · rutas (FR-002)', () => {
  it('/login muestra el inicio de sesión', () => {
    renderWithStubs();
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it('/registro muestra el registro', () => {
    goTo('/registro');
    renderWithStubs();
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
  });
});

describe('App · US1 de punta a punta con los adaptadores en memoria', () => {
  it('US1-1 y US1-3: registrarse lleva a /login con el aviso y la cuenta puede entrar', async () => {
    goTo('/registro');
    renderInMemory();
    await registerAccount();
    expect(await screen.findByRole('status')).toHaveTextContent(SUCCESS);
    expect(window.location.pathname).toBe('/login');

    await logIn(TEST_REGISTRATION.email, TEST_REGISTRATION.password);
    expect(
      await screen.findByRole('heading', { name: `¡Bienvenido, ${TEST_REGISTRATION.fullName}!` }),
    ).toBeInTheDocument();
  });

  it('US1-4: el aviso desaparece al escribir en el login', async () => {
    goTo('/registro');
    renderInMemory();
    await registerAccount();
    await screen.findByRole('status');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'a');
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument();
  });

  it('US1-5: el correo se guarda normalizado (mayúsculas y espacios)', async () => {
    goTo('/registro');
    renderInMemory();
    await registerAccount(`  ${TEST_REGISTRATION.email.toUpperCase()} `);
    await screen.findByRole('status');
    await logIn(TEST_REGISTRATION.email, TEST_REGISTRATION.password);
    expect(await screen.findByRole('heading', { name: /Bienvenido,/ })).toBeInTheDocument();
  });

  it('FR-012: al recargar (App y almacén nuevos) no hay aviso y la cuenta ya no existe', async () => {
    goTo('/registro');
    const { unmount } = renderInMemory();
    await registerAccount();
    await screen.findByRole('status');
    unmount();

    renderInMemory();
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument();
    await logIn(TEST_REGISTRATION.email, TEST_REGISTRATION.password);
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
  });

  it('FR-015 y FR-019: nada del registro en la URL ni en el almacenamiento del navegador', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    goTo('/registro');
    renderInMemory();
    await registerAccount();
    await screen.findByRole('status');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});

describe('App · US3 Navegar entre registro e inicio de sesión', () => {
  it('US3-1: "Inicia sesión" lleva a /login sin aviso y descarta los datos del registro', async () => {
    goTo('/registro');
    renderWithStubs();
    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana');
    await userEvent.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(window.location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
  });

  it('US3-2: "Regístrate" lleva a /registro con el formulario vacío', async () => {
    renderWithStubs();
    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(window.location.pathname).toBe('/registro');
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
  });

  it('US3-3: atrás y adelante muestran la pantalla de cada dirección', async () => {
    renderWithStubs();
    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    act(() => window.history.back());
    expect(await screen.findByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    act(() => window.history.forward());
    expect(await screen.findByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
  });

  it.each(['/', '/cualquier-cosa'])('US3-5: "%s" muestra el login en /login', (path) => {
    goTo(path);
    renderWithStubs();
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('FR-021: tras navegar, el foco está en el título de la pantalla nueva', async () => {
    renderWithStubs();
    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toHaveFocus();
    await userEvent.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toHaveFocus();
  });

  it('FR-014: el aviso no reaparece al ir al registro y volver al login', async () => {
    goTo('/registro');
    renderInMemory();
    await registerAccount();
    await screen.findByText(SUCCESS);
    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    await userEvent.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument();
  });
});

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = renderWithStubs();
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { container } = renderWithStubs();
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { container } = renderWithStubs();
    await logIn(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });

  it('002: registro vacío sin violaciones', async () => {
    goTo('/registro');
    const { container } = renderWithStubs();
    await expectNoA11yViolations(container);
  });

  it('002: registro con todos los errores y el aviso "Próximamente" sin violaciones', async () => {
    goTo('/registro');
    const { container } = renderWithStubs();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('002: registro con el correo en uso sin violaciones', async () => {
    goTo('/registro');
    const { container } = renderInMemory();
    await registerAccount(TEST_ACCOUNT.email);
    await screen.findByRole('alert');
    await expectNoA11yViolations(container);
  });

  it('002: login con el aviso de registro exitoso sin violaciones', async () => {
    goTo('/registro');
    const { container } = renderInMemory();
    await registerAccount();
    await screen.findByText(SUCCESS);
    await expectNoA11yViolations(container);
  });
});
