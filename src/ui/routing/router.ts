import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import { resolvePath, type Path } from './paths';

/**
 * Router mínimo sobre la History API (002 research.md R2): dos rutas fijas, sin dependencias.
 */
const listeners = new Set<() => void>();
let navigationCount = 0;

function notify() {
  listeners.forEach((listener) => listener());
}

function handlePopState() {
  navigationCount += 1;
  notify();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('popstate', handlePopState);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('popstate', handlePopState);
  };
}

const getPathname = () => window.location.pathname;

export function navigate(path: Path): void {
  if (window.location.pathname === path) return;
  navigationCount += 1;
  window.history.pushState(null, '', path);
  notify();
}

/** Ruta actual. Reemplaza la raíz y las direcciones desconocidas por /login (US3-5). */
export function useRoute(): Path {
  const pathname = useSyncExternalStore(subscribe, getPathname);
  const path = resolvePath(pathname);

  useEffect(() => {
    if (pathname !== path) window.history.replaceState(null, '', path);
  }, [pathname, path]);

  return path;
}

/** Enfoca el elemento al montarse si se llegó por navegación interna, no en la carga inicial (FR-021). */
export function useFocusOnNavigation(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (navigationCount > 0) ref.current?.focus();
  }, [ref]);
}
