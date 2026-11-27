import { describe, expect, it } from 'vitest';

import { resolveAdminRedirect } from './adminAccess';

const anonymous = { hasAuthToken: false, hasDemoSession: false };

describe('resolveAdminRedirect', () => {
  it('redirects an anonymous request to the login page', () => {
    expect(resolveAdminRedirect({ pathname: '/admin', ...anonymous })).toBe(
      '/admin/login?from=%2Fadmin',
    );
  });

  it('keeps the requested path in the from parameter', () => {
    expect(resolveAdminRedirect({ pathname: '/admin/annonces', ...anonymous })).toBe(
      '/admin/login?from=%2Fadmin%2Fannonces',
    );
  });

  it('lets the login page through without a session', () => {
    expect(resolveAdminRedirect({ pathname: '/admin/login', ...anonymous })).toBeNull();
  });

  it('lets a request through with the demo session', () => {
    expect(
      resolveAdminRedirect({ pathname: '/admin', hasAuthToken: false, hasDemoSession: true }),
    ).toBeNull();
  });

  it('lets a request through with the real auth cookie', () => {
    expect(
      resolveAdminRedirect({ pathname: '/admin', hasAuthToken: true, hasDemoSession: false }),
    ).toBeNull();
  });
});
