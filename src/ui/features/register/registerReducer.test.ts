import { initialRegisterState, registerReducer, type RegisterState } from './registerReducer';

const validValues: RegisterState['values'] = {
  fullName: 'Ana Pérez',
  email: 'ana@example.test',
  password: 'secreto-123',
  passwordConfirmation: 'secreto-123',
  termsAccepted: true,
};

const withValues = (values: Partial<RegisterState['values']> = {}): RegisterState => ({
  ...initialRegisterState,
  values: { ...validValues, ...values },
});

describe('registerReducer · US1 (data-model.md RegisterFormState)', () => {
  it('estado inicial: editing, valores vacíos y términos sin aceptar', () => {
    expect(initialRegisterState.status).toBe('editing');
    expect(initialRegisterState.values).toEqual({
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      termsAccepted: false,
    });
  });

  it('change y toggleTerms actualizan los valores', () => {
    let state = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'fullName',
      value: 'Ana',
    });
    state = registerReducer(state, { type: 'toggleTerms', checked: true });
    expect(state.values.fullName).toBe('Ana');
    expect(state.values.termsAccepted).toBe(true);
  });

  it('US1-1: submit válido → submitting', () => {
    expect(registerReducer(withValues(), { type: 'submit' }).status).toBe('submitting');
  });

  it('US1-2: un segundo submit en submitting se ignora', () => {
    const submitting = registerReducer(withValues(), { type: 'submit' });
    expect(registerReducer(submitting, { type: 'submit' })).toBe(submitting);
  });

  it('FR-010: submit con errores queda en editing', () => {
    const state = registerReducer(withValues({ termsAccepted: false }), { type: 'submit' });
    expect(state.status).toBe('editing');
    expect(state.fieldErrors.termsAccepted).toBeDefined();
  });
});

describe('registerReducer · US2 Validación en línea', () => {
  it('FR-009: blur marca el control como tocado y muestra su error', () => {
    const state = registerReducer(initialRegisterState, { type: 'blur', field: 'email' });
    expect(state.touched.email).toBe(true);
    expect(state.fieldErrors).toEqual({ email: 'Ingresa tu correo electrónico' });
  });

  it('US2-6: escribir en un control no muestra errores en los no tocados', () => {
    const state = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'email',
      value: 'usuario@',
    });
    expect(state.fieldErrors).toEqual({});
  });

  it('FR-007: con la confirmación tocada, cambiar la contraseña reevalúa la coincidencia', () => {
    let state = registerReducer(withValues(), { type: 'blur', field: 'passwordConfirmation' });
    expect(state.fieldErrors.passwordConfirmation).toBeUndefined();
    state = registerReducer(state, { type: 'change', field: 'password', value: 'secreto-999' });
    expect(state.fieldErrors.passwordConfirmation).toBe('Las contraseñas no coinciden');
    state = registerReducer(state, { type: 'change', field: 'password', value: 'secreto-123' });
    expect(state.fieldErrors.passwordConfirmation).toBeUndefined();
  });

  it('US2-7: corregir un control con error oculta su mensaje', () => {
    let state = registerReducer(initialRegisterState, { type: 'blur', field: 'fullName' });
    expect(state.fieldErrors.fullName).toBeDefined();
    state = registerReducer(state, { type: 'change', field: 'fullName', value: 'Ana' });
    expect(state.fieldErrors.fullName).toBeUndefined();
  });

  it('FR-010: submit con errores marca todo como tocado y no pasa a submitting', () => {
    const state = registerReducer(initialRegisterState, { type: 'submit' });
    expect(state.status).toBe('editing');
    expect(Object.values(state.touched).every(Boolean)).toBe(true);
    expect(Object.keys(state.fieldErrors)).toHaveLength(5);
  });
});

describe('registerReducer · US4 Correo ya registrado', () => {
  it.each(['email-taken', 'unavailable'] as const)(
    'US4-2: result %s conserva nombre y correo y vacía las contraseñas sin marcarlas',
    (kind) => {
      const submitting = registerReducer(withValues(), { type: 'submit' });
      const state = registerReducer(submitting, { type: 'result', result: { kind } });
      expect(state.status).toBe('registerError');
      expect(state.registerError).toBe(kind);
      expect(state.values).toMatchObject({
        fullName: validValues.fullName,
        email: validValues.email,
        password: '',
        passwordConfirmation: '',
      });
      expect(state.touched.password).toBe(false);
      expect(state.touched.passwordConfirmation).toBe(false);
      expect(state.fieldErrors).toEqual({});
    },
  );

  it('US4-2: editar cualquier campo limpia el error y vuelve a editing', () => {
    const submitting = registerReducer(withValues(), { type: 'submit' });
    const failed = registerReducer(submitting, {
      type: 'result',
      result: { kind: 'email-taken' },
    });
    const state = registerReducer(failed, { type: 'change', field: 'email', value: 'x' });
    expect(state.status).toBe('editing');
    expect(state.registerError).toBeNull();
  });
});

describe('registerReducer · US6 Avisos "Próximamente"', () => {
  it('FR-017: showNotice asigna el aviso sin tocar valores, controles tocados ni errores', () => {
    const before = registerReducer(withValues(), { type: 'blur', field: 'email' });
    const state = registerReducer(before, { type: 'showNotice', message: 'Próximamente' });
    expect(state.notice).toBe('Próximamente');
    expect(state.values).toEqual(before.values);
    expect(state.touched).toEqual(before.touched);
    expect(state.fieldErrors).toEqual(before.fieldErrors);
  });

  it('submit limpia el aviso', () => {
    const noticed = registerReducer(initialRegisterState, {
      type: 'showNotice',
      message: 'Próximamente',
    });
    expect(registerReducer(noticed, { type: 'submit' }).notice).toBeNull();
  });
});
