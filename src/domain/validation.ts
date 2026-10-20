import type { LoginCredentials } from './auth';
import { MESSAGES } from './messages';
import type { RegistrationForm } from './registration';

export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const FULL_NAME_MAX_LENGTH = 80;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Letras (incluidas las marcas diacríticas), espacios, apóstrofos, puntos y guiones (FR-004).
const FULL_NAME_PATTERN = /^[\p{L}\p{M} '.-]+$/u;

export type CredentialErrors = Partial<Record<keyof LoginCredentials, string>>;

/** Normaliza un correo para validarlo y compararlo: sin espacios periféricos y en minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(normalized);
}

export function isValidPasswordLength(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}

export function validateEmail(email: string): string | undefined {
  if (normalizeEmail(email) === '') return MESSAGES.EMAIL_REQUIRED;
  if (!isValidEmail(email)) return MESSAGES.EMAIL_INVALID;
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  // La contraseña se valida sin recortar (FR-004).
  if (password === '') return MESSAGES.PASSWORD_REQUIRED;
  if (password.length < PASSWORD_MIN_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > PASSWORD_MAX_LENGTH) return MESSAGES.PASSWORD_TOO_LONG;
  return undefined;
}

/** Reglas de FR-003 y FR-004. Devuelve {} si las credenciales son válidas. */
export function validateCredentials({ email, password }: LoginCredentials): CredentialErrors {
  const errors: CredentialErrors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function isValidFullName(fullName: string): boolean {
  return validateFullName(fullName) === undefined;
}

/** Nombre completo sin espacios periféricos, obligatorio, ≤ 80 caracteres permitidos (FR-004). */
export function validateFullName(fullName: string): string | undefined {
  const name = fullName.trim();
  if (name === '') return MESSAGES.FULL_NAME_REQUIRED;
  if (name.length > FULL_NAME_MAX_LENGTH) return MESSAGES.FULL_NAME_TOO_LONG;
  if (!FULL_NAME_PATTERN.test(name)) return MESSAGES.FULL_NAME_INVALID;
  return undefined;
}

/** La confirmación se compara exacta, sin recortar (FR-007). */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (confirmation === '') return MESSAGES.PASSWORD_CONFIRMATION_REQUIRED;
  if (confirmation !== password) return MESSAGES.PASSWORDS_DO_NOT_MATCH;
  return undefined;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationForm, string>>;

/** Reglas de FR-004 a FR-008. Devuelve {} si el formulario es válido. */
export function validateRegistration(form: RegistrationForm): RegistrationErrors {
  const candidates: RegistrationErrors = {
    fullName: validateFullName(form.fullName),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    passwordConfirmation: validatePasswordConfirmation(form.password, form.passwordConfirmation),
    termsAccepted: form.termsAccepted ? undefined : MESSAGES.TERMS_REQUIRED,
  };
  const errors: RegistrationErrors = {};
  for (const [field, message] of Object.entries(candidates) as [
    keyof RegistrationForm,
    string | undefined,
  ][]) {
    if (message) errors[field] = message;
  }
  return errors;
}
