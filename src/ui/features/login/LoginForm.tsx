import { useEffect, useRef, type FormEvent } from 'react';
import type { Authenticate } from '@/application/authenticate';
import { MESSAGES } from '@/domain/messages';
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
import { useLoginForm } from './useLoginForm';
import { WelcomeView } from './WelcomeView';
import styles from './LoginForm.module.css';

type LoginFormProps = {
  authenticate: Authenticate;
  /** Aviso que llega de otra pantalla (registro exitoso, 002 FR-014). */
  notice?: string | null;
  onNoticeDismiss?: () => void;
};

export function LoginForm({ authenticate, notice, onNoticeDismiss }: LoginFormProps) {
  const { state, change, blur, submit, logout, toggleRemember, showNotice } =
    useLoginForm(authenticate);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // 002 FR-021: al llegar desde otra pantalla, el foco va al título.
  useFocusOnNavigation(headingRef);

  // US2-4: tras credenciales incorrectas, el foco vuelve a la contraseña.
  useEffect(() => {
    if (state.authError === 'invalid-credentials') passwordRef.current?.focus();
  }, [state.authError]);

  if (state.status === 'welcome' && state.welcomeName) {
    return <WelcomeView name={state.welcomeName} onLogout={logout} />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = submit();
    // US3-1: el foco va al primer campo con error.
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
  };

  // 002 FR-014: el aviso de registro se oculta al modificar el formulario.
  const handleChange = (field: 'email' | 'password', value: string) => {
    change(field, value);
    if (notice) onNoticeDismiss?.();
  };

  // FR-016: elementos del diseño fuera del alcance de la demostración.
  const notAvailable = () => showNotice(MESSAGES.FEATURE_UNAVAILABLE);

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <FormHeading
        ref={headingRef}
        title="Bienvenido de nuevo"
        subtitle="Ingresa a tu cuenta para continuar"
      />

      {notice && <Alert tone="info">{notice}</Alert>}

      <TextField
        label="Correo electrónico"
        ref={emailRef}
        type="email"
        name="email"
        autoComplete="username"
        placeholder="tucorreo@ejemplo.com"
        value={state.values.email}
        error={state.fieldErrors.email}
        onChange={(event) => handleChange('email', event.target.value)}
        onBlur={() => blur('email')}
      />

      <PasswordField
        label="Contraseña"
        ref={passwordRef}
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={state.values.password}
        error={state.fieldErrors.password}
        onChange={(event) => handleChange('password', event.target.value)}
        onBlur={() => blur('password')}
      />

      <div className={styles.options}>
        <Checkbox label="Recordarme" checked={state.rememberMe} onChange={toggleRemember} />
        <Button variant="link" onClick={notAvailable}>
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {state.authError && (
        <Alert tone="error">
          {state.authError === 'invalid-credentials'
            ? MESSAGES.INVALID_CREDENTIALS
            : MESSAGES.UNAVAILABLE}
        </Alert>
      )}

      <Button
        type="submit"
        loading={state.status === 'submitting'}
        loadingLabel="Iniciando sesión…"
      >
        Iniciar sesión
      </Button>

      <Divider>o continúa con</Divider>

      <div className={styles.social}>
        <SocialButton provider="Google" onClick={notAvailable} />
        <SocialButton provider="Apple" onClick={notAvailable} />
      </div>

      {state.notice && <Alert tone="info">{state.notice}</Alert>}

      <FormFooter question="¿No tienes cuenta?" linkLabel="Regístrate" to={PATHS.register} />
    </form>
  );
}
