import logoMark from '@/ui/assets/logo-mark.svg';
import styles from './BrandPanel.module.css';

export type BrandPanelProps = {
  /** Una línea del titular por elemento. */
  title: readonly string[];
  subtitle: string;
  /** Degradado del frame correspondiente (002 research.md R7). */
  variant?: 'login' | 'register';
};

/** Panel de marca del diseño (Figma, nodos 2:3 y 31:3). */
export function BrandPanel({ title, subtitle, variant = 'login' }: BrandPanelProps) {
  return (
    <header
      className={[styles.panel, variant === 'register' && styles.register]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.logo}>
        <img src={logoMark} alt="" width={20} height={44} />
        <span className={styles.logoText}>KynWallet</span>
      </div>

      <div className={styles.headline}>
        <p className={styles.title}>
          {title.map((line) => (
            <span key={line} className={styles.titleLine}>
              {line}
            </span>
          ))}
        </p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardTop}>
          <span className={styles.cardName}>Kyn Card</span>
          <span className={styles.chip} />
        </div>
        <span className={styles.cardNumber}>{'5294  ••••  ••••  4827'}</span>
        <div className={styles.cardBottom}>
          <span>STEVEN LUNA</span>
          <span>12/29</span>
        </div>
      </div>
    </header>
  );
}
