import type { AuthProvider } from 'react-admin';

export const DEMO_SESSION_COOKIE = 'demo_session';
const DEMO_SESSION_MAX_AGE = 28800;
const DEMO_SESSION_PATH = '/admin';

/**
 * Drapeau de demonstration, pas un token d'authentification.
 * Il ne contient aucune identite, aucun JWT et aucun secret.
 */
export function hasDemoSession(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .some((entry) => entry.startsWith(`${DEMO_SESSION_COOKIE}=`));
}

export function setDemoSession(): void {
  document.cookie = `${DEMO_SESSION_COOKIE}=1; Path=${DEMO_SESSION_PATH}; SameSite=Lax; Max-Age=${DEMO_SESSION_MAX_AGE}`;
}

export function clearDemoSession(): void {
  document.cookie = `${DEMO_SESSION_COOKIE}=; Path=${DEMO_SESSION_PATH}; SameSite=Lax; Max-Age=0`;
}

export type FakeLoginParams = {
  username?: string;
  password?: string;
};

export const fakeAuthProvider: AuthProvider = {
  login: ({ username, password }: FakeLoginParams = {}) => {
    if (!username?.trim() || !password?.trim()) {
      return Promise.reject(new Error('Renseignez un email et un mot de passe.'));
    }

    setDemoSession();
    return Promise.resolve();
  },

  logout: () => {
    clearDemoSession();
    return Promise.resolve();
  },

  checkAuth: () => {
    if (hasDemoSession()) {
      return Promise.resolve();
    }

    return Promise.reject(new Error('Session de démonstration absente.'));
  },

  checkError: (error: { status?: number } = {}) => {
    if (error.status === 401) {
      clearDemoSession();
      return Promise.reject(error);
    }

    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(undefined),

  getIdentity: () =>
    Promise.resolve({
      id: 'demo-admin',
      fullName: 'Administrateur de démonstration',
    }),
};
