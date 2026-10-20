import { Link } from '@/ui/routing/Link';
import type { Path } from '@/ui/routing/paths';
import styles from './FormFooter.module.css';

type FormFooterProps = {
  question: string;
  linkLabel: string;
  to: Path;
};

/** Pie de los formularios de acceso: "¿No tienes cuenta? Regístrate" / "¿Ya tienes cuenta? Inicia sesión". */
export function FormFooter({ question, linkLabel, to }: FormFooterProps) {
  return (
    <p className={styles.footer}>
      {question}
      <Link to={to}>{linkLabel}</Link>
    </p>
  );
}
