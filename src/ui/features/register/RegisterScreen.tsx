import type { Register } from '@/application/register';
import { AuthLayout } from '@/ui/layout/AuthLayout/AuthLayout';
import { RegisterForm } from './RegisterForm';

const REGISTER_BRAND = {
  title: ['Comienza tu', 'camino financiero.'],
  subtitle:
    'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
  variant: 'register',
} as const;

type RegisterScreenProps = {
  register: Register;
  onRegistered: () => void;
};

/** Pantalla de registro (Figma, nodo 31:2). En móvil solo se muestra el formulario (FR-022). */
export function RegisterScreen({ register, onRegistered }: RegisterScreenProps) {
  return (
    <AuthLayout brand={REGISTER_BRAND} mobileBrand="hidden">
      <RegisterForm register={register} onRegistered={onRegistered} />
    </AuthLayout>
  );
}
