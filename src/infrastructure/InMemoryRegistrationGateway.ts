import type { RegistrationGateway } from '@/application/ports/RegistrationGateway';
import type { NewAccount, RegistrationResult } from '@/domain/registration';
import { normalizeEmail } from '@/domain/validation';
import type { InMemoryAccounts } from './InMemoryAccounts';
import { simulateLatency } from './simulateLatency';

/** Registro simulado en memoria (contracts/registration-gateway.md, research.md R4). */
export class InMemoryRegistrationGateway implements RegistrationGateway {
  private readonly accounts: InMemoryAccounts;
  private readonly delayMs: number | undefined;

  constructor(accounts: InMemoryAccounts, options: { delayMs?: number } = {}) {
    this.accounts = accounts;
    this.delayMs = options.delayMs;
  }

  async register(account: NewAccount): Promise<RegistrationResult> {
    await simulateLatency(this.delayMs);
    try {
      if (!this.accounts.isAvailable()) return { kind: 'unavailable' };
      // Verificación y alta en el mismo paso síncrono: dos registros concurrentes no duplican (R6).
      if (this.accounts.find(account.email)) return { kind: 'email-taken' };
      this.accounts.add({
        email: normalizeEmail(account.email),
        password: account.password,
        displayName: account.fullName,
      });
      return { kind: 'success' };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
