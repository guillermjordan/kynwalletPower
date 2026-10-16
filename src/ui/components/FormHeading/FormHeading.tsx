import type { Ref } from 'react';
import styles from './FormHeading.module.css';

type FormHeadingProps = {
  title: string;
  subtitle: string;
  ref?: Ref<HTMLHeadingElement>;
};

/** Título y subtítulo de los formularios de acceso. El h1 recibe el foco al cambiar de pantalla. */
export function FormHeading({ title, subtitle, ref }: FormHeadingProps) {
  return (
    <div className={styles.heading}>
      <h1 ref={ref} tabIndex={-1} className={styles.title}>
        {title}
      </h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
