import { describe, expect, it, vi } from 'vitest';

import { absoluteUrl, getSiteUrl, normalizeSiteUrl } from './site';

describe('normalizeSiteUrl', () => {
  it('removes trailing slashes', () => {
    expect(normalizeSiteUrl('https://exemple.test///')).toBe('https://exemple.test');
  });

  it('trims surrounding spaces', () => {
    expect(normalizeSiteUrl('  https://exemple.test/  ')).toBe('https://exemple.test');
  });
});

describe('getSiteUrl', () => {
  it('returns the configured site URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test/');
    expect(getSiteUrl()).toBe('https://exemple.test');
    vi.unstubAllEnvs();
  });

  it('falls back in development when the variable is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getSiteUrl()).toBe('http://localhost:8080');
    vi.unstubAllEnvs();
  });

  it('fails in production when the variable is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => getSiteUrl()).toThrow('NEXT_PUBLIC_SITE_URL is required');
    vi.unstubAllEnvs();
  });
});

describe('absoluteUrl', () => {
  it('builds the home canonical with a single trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');
    expect(absoluteUrl('/')).toBe('https://exemple.test/');
    vi.unstubAllEnvs();
  });

  it('normalizes a path with a trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');
    expect(absoluteUrl('/etude/')).toBe('https://exemple.test/etude');
    vi.unstubAllEnvs();
  });

  it('accepts a path without a leading slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');
    expect(absoluteUrl('etude')).toBe('https://exemple.test/etude');
    vi.unstubAllEnvs();
  });
});
