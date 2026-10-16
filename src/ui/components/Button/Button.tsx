import type { ButtonHTMLAttributes, ReactNode } from 'react';
import textLinkStyles from '@/ui/styles/textLink.module.css';
import styles from './Button.module.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'link';
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  loading = false,
  loadingLabel,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    variant === 'link' && textLinkStyles.textLink,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
