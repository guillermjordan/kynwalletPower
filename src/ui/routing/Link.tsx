import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import textLinkStyles from '@/ui/styles/textLink.module.css';
import type { Path } from './paths';
import { navigate } from './router';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: Path;
};

/** Enlace real (`<a href>`) que navega sin recargar; los clics modificados se dejan al navegador. */
export function Link({ to, className, onClick, children, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || event.button !== 0 || modified) return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <a
      {...rest}
      href={to}
      className={[textLinkStyles.textLink, className].filter(Boolean).join(' ')}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
