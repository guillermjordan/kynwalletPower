import { loadDemoAccounts } from './loadDemoAccounts';

const valid = { email: ' Ana@Example.test ', password: 'secreto-123', displayName: 'Ana' };
const raw = (value: unknown) => JSON.stringify(value);

describe('loadDemoAccounts', () => {
  it('JSON válido → cuentas con correo normalizado', () => {
    expect(loadDemoAccounts(raw([valid]))).toEqual([
      { email: 'ana@example.test', password: 'secreto-123', displayName: 'Ana' },
    ]);
  });

  it.each([
    ['indefinido', undefined],
    ['vacío', ''],
    ['JSON inválido', '{no-json'],
    ['no es arreglo', raw(valid)],
    ['arreglo vacío', raw([])],
  ])('devuelve null si la configuración es %s', (_label, value) => {
    expect(loadDemoAccounts(value)).toBeNull();
  });

  it.each([
    ['email: obligatorio', { ...valid, email: '' }],
    ['email: formato válido', { ...valid, email: 'ana@' }],
    ['password: obligatorio', { ...valid, password: '' }],
    ['password: 8–128 caracteres (corta)', { ...valid, password: '1234567' }],
    ['password: 8–128 caracteres (larga)', { ...valid, password: 'x'.repeat(129) }],
    ['displayName: obligatorio', { ...valid, displayName: '' }],
    ['displayName: 1–80 caracteres', { ...valid, displayName: 'x'.repeat(81) }],
    ['displayName: reglas de nombre completo (002 FR-004)', { ...valid, displayName: 'R2-D2' }],
    ['tipos incorrectos', { ...valid, password: 12345678 }],
    ['no es objeto', 'cuenta'],
  ])('devuelve null si una cuenta incumple "%s"', (_rule, account) => {
    expect(loadDemoAccounts(raw([account]))).toBeNull();
  });

  it('displayName de 80 caracteres es válido', () => {
    expect(loadDemoAccounts(raw([{ ...valid, displayName: 'x'.repeat(80) }]))).toHaveLength(1);
  });

  it('devuelve null si hay correos duplicados (sin distinguir mayúsculas)', () => {
    expect(loadDemoAccounts(raw([valid, { ...valid, email: 'ANA@example.test' }]))).toBeNull();
  });
});
