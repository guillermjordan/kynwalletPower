import type { RegistrationForm, RegistrationResult } from '@/domain/registration';
import { validateRegistration, type RegistrationErrors } from '@/domain/validation';
import { visibleErrors } from '@/ui/forms/visibleErrors';

export type RegisterField = keyof RegistrationForm;
export type TextField = Exclude<RegisterField, 'termsAccepted'>;

export type RegisterState = {
  status: 'editing' | 'submitting' | 'registerError';
  values: RegistrationForm;
  touched: Record<RegisterField, boolean>;
  fieldErrors: RegistrationErrors;
  registerError: 'email-taken' | 'unavailable' | null;
  /** Aviso "Próximamente" (FR-017). */
  notice: string | null;
};

export type RegisterAction =
  | { type: 'change'; field: TextField; value: string }
  | { type: 'toggleTerms'; checked: boolean }
  | { type: 'blur'; field: TextField }
  | { type: 'showNotice'; message: string }
  | { type: 'submit' }
  | { type: 'result'; result: Exclude<RegistrationResult, { kind: 'success' }> };

const untouched: Record<RegisterField, boolean> = {
  fullName: false,
  email: false,
  password: false,
  passwordConfirmation: false,
  termsAccepted: false,
};

export const initialRegisterState: RegisterState = {
  status: 'editing',
  values: {
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    termsAccepted: false,
  },
  touched: untouched,
  fieldErrors: {},
  registerError: null,
  notice: null,
};

/** Recalcula con todos los valores: la coincidencia de contraseñas se reevalúa sola (FR-007). */
function currentErrors(values: RegistrationForm, touched: RegisterState['touched']) {
  return visibleErrors(validateRegistration(values), touched);
}

function withValues(state: RegisterState, values: RegistrationForm): RegisterState {
  return {
    ...state,
    status: state.status === 'registerError' ? 'editing' : state.status,
    registerError: null,
    values,
    fieldErrors: currentErrors(values, state.touched),
  };
}

/** Máquina de estados del formulario de registro (data-model.md, RegisterFormState). */
export function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'change':
      return withValues(state, { ...state.values, [action.field]: action.value });

    case 'toggleTerms':
      return withValues(state, { ...state.values, termsAccepted: action.checked });

    case 'blur': {
      const touched = { ...state.touched, [action.field]: true };
      return { ...state, touched, fieldErrors: currentErrors(state.values, touched) };
    }

    case 'showNotice':
      return { ...state, notice: action.message };

    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched = Object.fromEntries(
        Object.keys(untouched).map((field) => [field, true]),
      ) as RegisterState['touched'];
      const fieldErrors = currentErrors(state.values, touched);
      // FR-010: no se registra mientras existan errores de validación.
      const status = Object.keys(fieldErrors).length > 0 ? 'editing' : 'submitting';
      return { ...state, status, touched, fieldErrors, registerError: null, notice: null };
    }

    case 'result': {
      // US4-2: se conservan nombre y correo; las contraseñas se vacían sin mostrarlas como faltantes.
      const values = { ...state.values, password: '', passwordConfirmation: '' };
      const touched = { ...state.touched, password: false, passwordConfirmation: false };
      return {
        ...state,
        status: 'registerError',
        registerError: action.result.kind,
        values,
        touched,
        fieldErrors: currentErrors(values, touched),
      };
    }
  }
}
