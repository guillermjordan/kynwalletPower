import type { Account } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';

/**
 * Cuentas en memoria compartidas por la autenticación y el registro simulados (002 research.md R4).
 * `null` representa una configuración inválida: el almacén queda no disponible.
 */
export class InMemoryAccounts {
  private readonly accounts: Account[] | null;

  constructor(accounts: readonly Account[] | null) {
    this.accounts = accounts ? [...accounts] : null;
  }

  isAvailable(): boolean {
    return this.accounts !== null;
  }

  find(email: string): Account | undefined {
    const normalized = normalizeEmail(email);
    return this.accounts?.find((account) => normalizeEmail(account.email) === normalized);
  }

  /** Quien llama verificó antes que el correo no existe. */
  add(account: Account): void {
    this.accounts?.push(account);
  }
}
