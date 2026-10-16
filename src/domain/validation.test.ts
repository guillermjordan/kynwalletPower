import { MESSAGES } from './messages';
import type { RegistrationForm } from './registration';
import {
  FULL_NAME_MAX_LENGTH,
  normalizeEmail,
  validateCredentials,
  validateFullName,
  validatePasswordConfirmation,
  validateRegistration,
} from './validation';

describe('normalizeEmail', () => {
  it('US1-3: recorta espacios periféricos y convierte a minúsculas', () => {
    expect(normalizeEmail('  Demo@Example.COM ')).toBe('demo@example.com');
  });

  it('no altera el contenido interior', () => {
    expect(normalizeEmail('a.b+c@d.com')).toBe('a.b+c@d.com');
  });
});

describe('validateCredentials (data-model.md)', () => {
  const valid = { email: 'ana@example.test', password: 'secreto-123' };

  it('credenciales válidas → {}', () => {
    expect(validateCredentials(valid)).toEqual({});
  });

  it.each(['', '   '])('correo vacío tras trim (%j) → EMAIL_REQUIRED', (email) => {
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_REQUIRED);
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', 'a b@c.com'])(
    'US3-2: correo sin formato válido (%s) → EMAIL_INVALID',
    (email) => {
      expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
    },
  );

  it('correo de > 254 caracteres → EMAIL_INVALID', () => {
    const email = `${'a'.repeat(245)}@example.test`;
    expect(email.length).toBeGreaterThan(254);
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
  });

  it('acepta el correo con espacios periféricos', () => {
    expect(validateCredentials({ ...valid, email: '  Ana@Example.test ' })).toEqual({});
  });

  it('contraseña vacía → PASSWORD_REQUIRED', () => {
    expect(validateCredentials({ ...valid, password: '' }).password).toBe(
      MESSAGES.PASSWORD_REQUIRED,
    );
  });

  it('US3-3: contraseña de < 8 caracteres → PASSWORD_TOO_SHORT', () => {
    expect(validateCredentials({ ...valid, password: '1234567' }).password).toBe(
      MESSAGES.PASSWORD_TOO_SHORT,
    );
  });

  it('contraseña de > 128 caracteres → PASSWORD_TOO_LONG', () => {
    expect(validateCredentials({ ...valid, password: 'x'.repeat(129) }).password).toBe(
      MESSAGES.PASSWORD_TOO_LONG,
    );
  });

  it('la contraseña no se recorta: 7 caracteres + espacios cuenta los espacios', () => {
    expect(validateCredentials({ ...valid, password: ' 123456 ' })).toEqual({});
    expect(validateCredentials({ ...valid, password: '        ' })).toEqual({});
  });
});

describe('validateFullName (002 data-model.md, FR-004)', () => {
  it('FR-004: el máximo es 80 caracteres', () => {
    expect(FULL_NAME_MAX_LENGTH).toBe(80);
  });

  it.each(['', '   '])('vacío o solo espacios (%j) → FULL_NAME_REQUIRED', (name) => {
    expect(validateFullName(name)).toBe(MESSAGES.FULL_NAME_REQUIRED);
  });

  it.each(["María José O'Neill-Núñez", 'J. R. Smith', 'Ñandú Pérez', '  Ana  '])(
    'acepta letras con tildes, ñ, espacios, apóstrofos, guiones y puntos: %j',
    (name) => {
      expect(validateFullName(name)).toBeUndefined();
    },
  );

  it.each(['R2-D2', 'Ana@', 'Ana_Luz', 'Ana 😀'])(
    'caracteres no permitidos (%j) → inválido',
    (name) => {
      expect(validateFullName(name)).toBe(MESSAGES.FULL_NAME_INVALID);
    },
  );

  it('80 caracteres es válido y 81 supera el máximo (sin contar espacios periféricos)', () => {
    expect(validateFullName('a'.repeat(80))).toBeUndefined();
    expect(validateFullName(`  ${'a'.repeat(80)}  `)).toBeUndefined();
    expect(validateFullName('a'.repeat(81))).toBe(MESSAGES.FULL_NAME_TOO_LONG);
  });
});

describe('validatePasswordConfirmation (FR-007)', () => {
  it('vacía → PASSWORD_CONFIRMATION_REQUIRED', () => {
    expect(validatePasswordConfirmation('secreto-123', '')).toBe(
      MESSAGES.PASSWORD_CONFIRMATION_REQUIRED,
    );
  });

  it('distinta → PASSWORDS_DO_NOT_MATCH', () => {
    expect(validatePasswordConfirmation('secreto-123', 'secreto-124')).toBe(
      MESSAGES.PASSWORDS_DO_NOT_MATCH,
    );
  });

  it('compara sin recortar espacios', () => {
    expect(validatePasswordConfirmation('secreto-123 ', 'secreto-123')).toBe(
      MESSAGES.PASSWORDS_DO_NOT_MATCH,
    );
    expect(validatePasswordConfirmation(' secreto-123 ', ' secreto-123 ')).toBeUndefined();
  });
});

describe('validateRegistration (002 data-model.md, RegistrationForm)', () => {
  const valid: RegistrationForm = {
    fullName: 'Ana Pérez',
    email: 'ana@example.test',
    password: 'secreto-123',
    passwordConfirmation: 'secreto-123',
    termsAccepted: true,
  };

  it('datos válidos → {}', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('US2-1: formulario vacío → un error por control', () => {
    expect(
      validateRegistration({
        fullName: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        termsAccepted: false,
      }),
    ).toEqual({
      fullName: MESSAGES.FULL_NAME_REQUIRED,
      email: MESSAGES.EMAIL_REQUIRED,
      password: MESSAGES.PASSWORD_REQUIRED,
      passwordConfirmation: MESSAGES.PASSWORD_CONFIRMATION_REQUIRED,
      termsAccepted: MESSAGES.TERMS_REQUIRED,
    });
  });

  it('FR-005 y FR-006: reutiliza las reglas de correo y contraseña del login', () => {
    const errors = validateRegistration({
      ...valid,
      email: 'usuario@',
      password: '1234567',
      passwordConfirmation: '1234567',
    });
    expect(errors.email).toBe(MESSAGES.EMAIL_INVALID);
    expect(errors.password).toBe(MESSAGES.PASSWORD_TOO_SHORT);
  });

  it('FR-008: términos sin aceptar → TERMS_REQUIRED', () => {
    expect(validateRegistration({ ...valid, termsAccepted: false })).toEqual({
      termsAccepted: MESSAGES.TERMS_REQUIRED,
    });
  });

  it('FR-007: confirmación distinta → PASSWORDS_DO_NOT_MATCH', () => {
    expect(validateRegistration({ ...valid, passwordConfirmation: 'otra-clave' })).toEqual({
      passwordConfirmation: MESSAGES.PASSWORDS_DO_NOT_MATCH,
    });
  });
});
