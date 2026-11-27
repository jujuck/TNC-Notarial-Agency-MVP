export type AdminAccessInput = {
  pathname: string;
  hasAuthToken: boolean;
  hasDemoSession: boolean;
};

export const ADMIN_LOGIN_PATH = '/admin/login';

/**
 * Decide si une requete /admin doit etre redirigee vers le login.
 * Retourne l'URL de redirection, ou null si la requete peut continuer.
 *
 * Ce n'est qu'un confort de navigation : la protection des donnees reste
 * assuree par l'API, pas par ce middleware.
 */
export function resolveAdminRedirect({
  pathname,
  hasAuthToken,
  hasDemoSession,
}: AdminAccessInput): string | null {
  if (pathname === ADMIN_LOGIN_PATH) {
    return null;
  }

  if (hasAuthToken || hasDemoSession) {
    return null;
  }

  const from = encodeURIComponent(pathname);
  return `${ADMIN_LOGIN_PATH}?from=${from}`;
}
