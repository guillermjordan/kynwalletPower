import type { NewAccount, RegistrationResult } from '@/domain/registration';
import { normalizeEmail } from '@/domain/validation';
import type { RegistrationGateway } from './ports/RegistrationGateway';

export type Register = (account: NewAccount) => Promise<RegistrationResult>;

/** Caso de uso: crea una cuenta delegando en el puerto de registro. */
export function createRegister(gateway: RegistrationGateway): Register {
  return async ({ fullName, email, password }) => {
    try {
      return await gateway.register({
        fullName: fullName.trim(),
        email: normalizeEmail(email),
        password,
      });
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
