import type { Account } from '@/domain/auth';

/** Cuenta ficticia exclusiva de pruebas; no corresponde a ningún sistema real (research.md R4). */
export const TEST_ACCOUNT: Account = {
  email: 'steven.luna@example.test',
  password: 'fixture-pass-01',
  displayName: 'Steven Luna',
};

/** Datos de registro ficticios exclusivos de pruebas (002). */
export const TEST_REGISTRATION = {
  fullName: 'Diego Martínez',
  email: 'diego.martinez@example.test',
  password: 'fixture-pass-02',
} as const;
