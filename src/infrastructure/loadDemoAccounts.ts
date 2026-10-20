import type { Account } from '@/domain/auth';
import {
  isValidEmail,
  isValidFullName,
  isValidPasswordLength,
  normalizeEmail,
} from '@/domain/validation';

function toAccount(value: unknown): Account | null {
  if (typeof value !== 'object' || value === null) return null;
  const { email, password, displayName } = value as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  if (typeof displayName !== 'string') return null;

  // El nombre sigue las mismas reglas que el registro (002 FR-004), fuente única en el dominio.
  if (!isValidEmail(email) || !isValidPasswordLength(password) || !isValidFullName(displayName)) {
    return null;
  }

  return { email: normalizeEmail(email), password, displayName: displayName.trim() };
}

/**
 * Lee las cuentas de demostración de la configuración externa (VITE_DEMO_USERS).
 * Devuelve null si la configuración falta o es inválida (contracts/auth-gateway.md).
 */
export function loadDemoAccounts(raw: string | undefined): Account[] | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const accounts: Account[] = [];
  for (const item of parsed) {
    const account = toAccount(item);
    if (!account) return null;
    accounts.push(account);
  }
  const uniqueEmails = new Set(accounts.map((account) => account.email));
  return uniqueEmails.size === accounts.length ? accounts : null;
}
