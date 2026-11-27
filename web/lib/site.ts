export const FALLBACK_SITE_URL = 'http://localhost:8080';

export function normalizeSiteUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL;

  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_SITE_URL is required');
    }

    return FALLBACK_SITE_URL;
  }

  return normalizeSiteUrl(value);
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === '/') {
    return `${base}/`;
  }

  return `${base}${normalizedPath.replace(/\/+$/, '')}`;
}
