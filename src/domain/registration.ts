/** Datos del formulario de registro (data-model.md, RegistrationForm). */
export type RegistrationForm = {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  termsAccepted: boolean;
};

/** Cuenta a crear: lo que el caso de uso envía al puerto (contracts/registration-gateway.md). */
export type NewAccount = {
  fullName: string;
  email: string;
  password: string;
};

export type RegistrationResult =
  { kind: 'success' } | { kind: 'email-taken' } | { kind: 'unavailable' };
