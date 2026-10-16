import { useCallback, useState } from 'react';
import type { Authenticate } from '@/application/authenticate';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { LoginScreen } from '@/ui/features/login/LoginScreen';
import { RegisterScreen } from '@/ui/features/register/RegisterScreen';
import { PATHS } from '@/ui/routing/paths';
import { navigate, useRoute } from '@/ui/routing/router';

type AppProps = {
  authenticate: Authenticate;
  register: Register;
};

export function App({ authenticate, register }: AppProps) {
  const route = useRoute();
  // Aviso de registro exitoso: solo en memoria, nunca en la URL (research.md R3, FR-015).
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);
  const [previousRoute, setPreviousRoute] = useState(route);

  // FR-014: el aviso se muestra una sola vez; se descarta al salir de /login.
  if (route !== previousRoute) {
    setPreviousRoute(route);
    if (route !== PATHS.login) setRegistrationNotice(null);
  }

  const handleRegistered = useCallback(() => {
    setRegistrationNotice(MESSAGES.REGISTRATION_SUCCESS);
    navigate(PATHS.login);
  }, []);

  const dismissNotice = useCallback(() => setRegistrationNotice(null), []);

  if (route === PATHS.register) {
    return <RegisterScreen register={register} onRegistered={handleRegistered} />;
  }
  return (
    <LoginScreen
      authenticate={authenticate}
      notice={registrationNotice}
      onNoticeDismiss={dismissNotice}
    />
  );
}
