import { afterEach, describe, expect, it, vi } from 'vitest';

import { ROBOTS_NOINDEX, buildSeoMetadata } from './Seo';

afterEach(() => {
  vi.unstubAllEnvs();
});

const baseProps = {
  title: "Etude notariale de l'Exemple",
  description: 'Description de demonstration pour la page d accueil.',
  path: '/',
};

describe('ROBOTS_NOINDEX', () => {
  it('is the only robots value allowed', () => {
    expect(ROBOTS_NOINDEX).toBe('noindex, nofollow');
  });
});

describe('buildSeoMetadata', () => {
  it('builds every expected metadata field', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');

    const metadata = buildSeoMetadata(baseProps);

    expect(metadata.title).toBe(baseProps.title);
    expect(metadata.description).toBe(baseProps.description);
    expect(metadata.canonical).toBe('https://exemple.test/');
    expect(metadata.robots).toBe('noindex, nofollow');
    expect(metadata.openGraph).toMatchObject({
      'og:type': 'website',
      'og:title': baseProps.title,
      'og:description': baseProps.description,
      'og:url': 'https://exemple.test/',
      'og:image': 'https://exemple.test/images/partage.svg',
      'og:locale': 'fr_FR',
    });
    expect(metadata.twitter).toMatchObject({
      'twitter:card': 'summary_large_image',
      'twitter:title': baseProps.title,
      'twitter:description': baseProps.description,
      'twitter:image': 'https://exemple.test/images/partage.svg',
    });
  });

  it('never exposes an index value, whatever the input', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');

    const inputs = [
      { ...baseProps, path: '/admin', type: 'article' as const },
      { ...baseProps, path: '/', image: '/images/partage.svg' },
      { ...baseProps, path: '/sitemap.xml', jsonLd: { '@type': 'WebSite' } },
    ];

    for (const input of inputs) {
      const { robots } = buildSeoMetadata(input);
      const tokens = robots.split(',').map((token) => token.trim());

      // Les jetons doivent être exactement noindex + nofollow, sans index/follow seuls.
      expect(tokens).toEqual(['noindex', 'nofollow']);
      expect(tokens).not.toContain('index');
      expect(tokens).not.toContain('follow');
      expect(tokens).not.toContain('all');
    }
  });

  it('keeps the noindex when no SEO environment variable is set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('NODE_ENV', 'development');

    expect(buildSeoMetadata(baseProps).robots).toBe('noindex, nofollow');
  });

  it('normalizes the canonical and image URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test///');

    const metadata = buildSeoMetadata({
      ...baseProps,
      path: '/etude/',
      image: '/images/etude.png',
    });

    expect(metadata.canonical).toBe('https://exemple.test/etude');
    expect(metadata.image).toBe('https://exemple.test/images/etude.png');
  });

  it('accepts a single JSON-LD node and an array', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');

    const single = buildSeoMetadata({
      ...baseProps,
      jsonLd: { '@type': 'Organization' },
    });
    const multiple = buildSeoMetadata({
      ...baseProps,
      jsonLd: [{ '@type': 'Organization' }, { '@type': 'WebSite' }],
    });

    expect(single.jsonLd).toHaveLength(1);
    expect(multiple.jsonLd).toHaveLength(2);
    expect(multiple.jsonLd.map((node) => node['@type'])).toEqual(['Organization', 'WebSite']);
  });

  it('returns no JSON-LD when none is provided', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');

    expect(buildSeoMetadata(baseProps).jsonLd).toEqual([]);
  });
});
