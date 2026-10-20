import { useEffect, useRef, type FormEvent } from 'react';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import type { RegistrationForm } from '@/domain/registration';
import { Alert } from '@/ui/components/Alert/Alert';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Divider } from '@/ui/components/Divider/Divider';
import { FormFooter } from '@/ui/components/FormFooter/FormFooter';
import { FormHeading } from '@/ui/components/FormHeading/FormHeading';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TextField } from '@/ui/components/TextField/TextField';
import { PATHS } from '@/ui/routing/paths';
import { useFocusOnNavigation } from '@/ui/routing/router';
import { useRegisterForm } from './useRegisterForm';
import styles from './RegisterForm.module.css';

const FIELD_ORDER: readonly (keyof RegistrationForm)[] = [
  'fullName',
  'email',
  'password',
  'passwordConfirmation',
  'termsAccepted',
];

type RegisterFormProps = {
  register: Register;
  onRegistered: () => void;
};

/** Formulario del frame 04 · Registro (contracts/ui-register.md). */
export function RegisterForm({ register, onRegistered }: RegisterFormProps) {
  const { state, change, blur, toggleTerms, showNotice, submit } = useRegisterForm(
    register,
    onRegistered,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  // FR-021: al llegar desde otra pantalla, el foco va al título.
  useFocusOnNavigation(headingRef);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  // US4-1: con el correo en uso, el foco vuelve al correo.
  useEffect(() => {
    if (state.registerError === 'email-taken') emailRef.current?.focus();
  }, [state.registerError]);

  // FR-017: opciones del diseño que todavía no están disponibles.
  const comingSoon = () => showNotice(MESSAGES.COMING_SOON);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = submit();
    // FR-010: el foco va al primer control con error, en el orden visual del formulario.
    const refs = {
      fullName: fullNameRef,
      email: emailRef,
      password: passwordRef,
      passwordConfirmation: confirmationRef,
      termsAccepted: termsRef,
    };
    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) refs[firstInvalid].current?.focus();
  };

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <FormHeading
        ref={headingRef}
        title="Crea tu cuenta"
        subtitle="Completa tus datos para comenzar"
      />

      <TextField
        label="Nombre completo"
        name="fullName"
        autoComplete="name"
        placeholder="Ej: Diego Martínez"
        value={state.values.fullName}
        error={state.fieldErrors.fullName}
        onChange={(event) => change('fullName', event.target.value)}
        onBlur={() => blur('fullName')}
        ref={fullNameRef}
      />

      <TextField
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        value={state.values.email}
        error={state.fieldErrors.email}
        onChange={(event) => change('email', event.target.value)}
        onBlur={() => blur('email')}
        ref={emailRef}
      />

      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.password}
        error={state.fieldErrors.password}
        onChange={(event) => change('password', event.target.value)}
        onBlur={() => blur('password')}
        ref={passwordRef}
      />

      <PasswordField
        label="Confirmar contraseña"
        name="passwordConfirmation"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.passwordConfirmation}
        error={state.fieldErrors.passwordConfirmation}
        onChange={(event) => change('passwordConfirmation', event.target.value)}
        onBlur={() => blur('passwordConfirmation')}
        ref={confirmationRef}
      />

      <Checkbox
        label={
          <>
            Acepto los{' '}
            {/* Dentro de la etiqueta: activarlo no cambia la casilla (US6-2, research.md R9). */}
            <Button variant="link" className={styles.termsLink} onClick={comingSoon}>
              términos y condiciones
            </Button>
          </>
        }
        checked={state.values.termsAccepted}
        error={state.fieldErrors.termsAccepted}
        onChange={toggleTerms}
        ref={termsRef}
      />

      {state.registerError && (
        <Alert tone="error">
          {state.registerError === 'email-taken'
            ? MESSAGES.EMAIL_TAKEN
            : MESSAGES.REGISTRATION_UNAVAILABLE}
        </Alert>
      )}

      <Button
        type="submit"
        className={styles.submit}
        loading={state.status === 'submitting'}
        loadingLabel="Creando cuenta…"
      >
        Crear cuenta
      </Button>

      <Divider>o regístrate con</Divider>

      <div className={styles.social}>
        <SocialButton provider="Google" onClick={comingSoon} />
        <SocialButton provider="Apple" onClick={comingSoon} />
      </div>

      {state.notice && <Alert tone="info">{state.notice}</Alert>}

      <FormFooter question="¿Ya tienes cuenta?" linkLabel="Inicia sesión" to={PATHS.login} />
    </form>
  );
}
