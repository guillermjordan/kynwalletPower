import type { AuthGateway } from '@/application/ports/AuthGateway';
import type { AuthResult, LoginCredentials } from '@/domain/auth';
import type { InMemoryAccounts } from './InMemoryAccounts';
import { simulateLatency } from './simulateLatency';

/** Autenticación simulada en memoria (contracts/auth-gateway.md, research.md R5). */
export class InMemoryAuthGateway implements AuthGateway {
  private readonly accounts: InMemoryAccounts;
  private readonly delayMs: number | undefined;

  constructor(accounts: InMemoryAccounts, options: { delayMs?: number } = {}) {
    this.accounts = accounts;
    this.delayMs = options.delayMs;
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    await simulateLatency(this.delayMs);
    try {
      if (!this.accounts.isAvailable()) return { kind: 'unavailable' };
      const account = this.accounts.find(credentials.email);
      // Correo inexistente y contraseña incorrecta producen el mismo resultado (FR-010).
      if (!account || account.password !== credentials.password) {
        return { kind: 'invalid-credentials' };
      }
      return { kind: 'success', displayName: account.displayName };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
