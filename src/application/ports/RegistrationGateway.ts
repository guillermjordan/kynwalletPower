import type { NewAccount, RegistrationResult } from '@/domain/registration';

/** Puerto de registro (contracts/registration-gateway.md). Separado de AuthGateway (ISP). */
export interface RegistrationGateway {
  register(account: NewAccount): Promise<RegistrationResult>;
}
