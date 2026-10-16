/** Rutas de la aplicación (002 FR-002). */
export const PATHS = {
  login: '/login',
  register: '/registro',
} as const;

export type Path = (typeof PATHS)[keyof typeof PATHS];

const KNOWN_PATHS: readonly string[] = Object.values(PATHS);

/** La raíz y las direcciones desconocidas llevan al login. */
export function resolvePath(pathname: string): Path {
  return KNOWN_PATHS.includes(pathname) ? (pathname as Path) : PATHS.login;
}
