import type { ReactNode } from 'react';
import { BrandPanel, type BrandPanelProps } from '@/ui/layout/BrandPanel/BrandPanel';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
  brand: BrandPanelProps;
  /** En móvil: `logo` muestra una cabecera con el logo (login); `hidden` solo el formulario (registro). */
  mobileBrand: 'logo' | 'hidden';
  children: ReactNode;
};

/** Layout de dos paneles de las pantallas de acceso (002 research.md R8). */
export function AuthLayout({ brand, mobileBrand, children }: AuthLayoutProps) {
  return (
    <div className={styles.screen} data-mobile-brand={mobileBrand}>
      <BrandPanel {...brand} />
      <main className={styles.formPanel}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
