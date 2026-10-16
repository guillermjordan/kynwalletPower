import type { Authenticate } from '@/application/authenticate';
import { AuthLayout } from '@/ui/layout/AuthLayout/AuthLayout';
import { LoginForm } from './LoginForm';

const LOGIN_BRAND = {
  title: ['Tu dinero,', 'sin fronteras.'],
  subtitle: 'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.',
};

type LoginScreenProps = {
  authenticate: Authenticate;
  notice?: string | null;
  onNoticeDismiss?: () => void;
};

/** Pantalla de login (Figma, nodo 2:2): panel de marca + formulario. */
export function LoginScreen({ authenticate, notice, onNoticeDismiss }: LoginScreenProps) {
  return (
    <AuthLayout brand={LOGIN_BRAND} mobileBrand="logo">
      <LoginForm authenticate={authenticate} notice={notice} onNoticeDismiss={onNoticeDismiss} />
    </AuthLayout>
  );
}
