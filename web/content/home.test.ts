import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildHomeJsonLd, homeContent } from './home';
import { siteContent } from './site';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildHomeJsonLd', () => {
  it('exposes Organization, Notary and WebSite nodes', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test');

    const types = buildHomeJsonLd().map((node) => node['@type']);

    expect(types).toContain('Organization');
    expect(types).toContain('Notary');
    expect(types).toContain('WebSite');
  });

  it('uses the absolute site URL for every node', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://exemple.test/');

    const nodes = buildHomeJsonLd();

    expect(nodes.every((node) => node.url === 'https://exemple.test/')).toBe(true);
    expect(nodes.every((node) => node['@context'] === 'https://schema.org')).toBe(true);
  });
});

describe('home anchors', () => {
  it('exposes the anchors rendered on the home page', () => {
    const anchors = siteContent.nav.map((item) => item.href);

    expect(anchors).toEqual(['#etude', '#domaines', '#honoraires', '#contact']);
  });

  it('defines the content section behind each anchor', () => {
    expect(homeContent.study.title).toBeTruthy();
    expect(homeContent.domains.title).toBeTruthy();
    expect(homeContent.fees.title).toBeTruthy();
    expect(homeContent.contact.title).toBeTruthy();
  });
});
