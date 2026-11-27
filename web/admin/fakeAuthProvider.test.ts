import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  clearDemoSession,
  fakeAuthProvider,
  hasDemoSession,
  setDemoSession,
} from './fakeAuthProvider';

beforeEach(() => {
  clearDemoSession();
});

afterEach(() => {
  clearDemoSession();
});

describe('fakeAuthProvider.login', () => {
  it('rejects an empty form', async () => {
    await expect(fakeAuthProvider.login!({ username: '', password: '' })).rejects.toThrow(
      'Renseignez un email et un mot de passe.',
    );
    expect(hasDemoSession()).toBe(false);
  });

  it('rejects a whitespace-only form', async () => {
    await expect(
      fakeAuthProvider.login!({ username: '   ', password: '   ' }),
    ).rejects.toThrow();
    expect(hasDemoSession()).toBe(false);
  });

  it('accepts any non-empty pair and sets the demo cookie', async () => {
    await expect(
      fakeAuthProvider.login!({ username: 'demo@exemple.test', password: 'demo' }),
    ).resolves.toBeUndefined();

    expect(hasDemoSession()).toBe(true);
  });
});

describe('fakeAuthProvider.logout', () => {
  it('removes the demo cookie', async () => {
    setDemoSession();
    expect(hasDemoSession()).toBe(true);

    await fakeAuthProvider.logout!({});

    expect(hasDemoSession()).toBe(false);
  });
});

describe('fakeAuthProvider.checkAuth', () => {
  it('rejects without a session', async () => {
    await expect(fakeAuthProvider.checkAuth!({})).rejects.toThrow(
      'Session de démonstration absente.',
    );
  });

  it('resolves with the demo session', async () => {
    setDemoSession();
    await expect(fakeAuthProvider.checkAuth!({})).resolves.toBeUndefined();
  });
});

describe('fakeAuthProvider.checkError', () => {
  it('rejects and clears the session on 401', async () => {
    setDemoSession();

    await expect(fakeAuthProvider.checkError!({ status: 401 })).rejects.toMatchObject({
      status: 401,
    });
    expect(hasDemoSession()).toBe(false);
  });

  it('resolves on other errors', async () => {
    setDemoSession();

    await expect(fakeAuthProvider.checkError!({ status: 500 })).resolves.toBeUndefined();
    expect(hasDemoSession()).toBe(true);
  });
});

describe('fakeAuthProvider identity', () => {
  it('returns a fictitious administrator', async () => {
    await expect(fakeAuthProvider.getIdentity!()).resolves.toEqual({
      id: 'demo-admin',
      fullName: 'Administrateur de démonstration',
    });
  });

  it('keeps the demo cookie non sensitive', async () => {
    setDemoSession();

    const cookie = document.cookie;
    expect(cookie).toContain('demo_session=1');
    expect(cookie).not.toMatch(/eyJ/);
    expect(cookie).not.toContain('@');
  });
});
