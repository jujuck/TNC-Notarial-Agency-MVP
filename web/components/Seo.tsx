import Head from 'next/head';

import { absoluteUrl } from '@/lib/site';

/**
 * Invariant de demonstration : le site n'est jamais indexable.
 * Aucune prop, variable d'environnement ou condition ne peut le desactiver.
 */
export const ROBOTS_NOINDEX = 'noindex, nofollow';

export type JsonLdNode = Record<string, unknown>;

export type SeoProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: JsonLdNode | JsonLdNode[];
};

export type SeoMetadata = {
  title: string;
  description: string;
  robots: string;
  canonical: string;
  image: string;
  type: 'website' | 'article';
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  jsonLd: JsonLdNode[];
};

/**
 * Calcule les metadonnees SEO. Fonction pure pour rester testable sans DOM.
 * `robots` est toujours `ROBOTS_NOINDEX`, sans exception ni parametre.
 */
export function buildSeoMetadata({
  title,
  description,
  path,
  image = '/images/partage.svg',
  type = 'website',
  jsonLd,
}: SeoProps): SeoMetadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    robots: ROBOTS_NOINDEX,
    canonical,
    image: imageUrl,
    type,
    openGraph: {
      'og:type': type,
      'og:site_name': "Étude notariale de l'Exemple",
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
      'og:image': imageUrl,
      'og:locale': 'fr_FR',
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl,
    },
    jsonLd: jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [],
  };
}

export function Seo(props: SeoProps) {
  const metadata = buildSeoMetadata(props);

  return (
    <Head>
      <title key="title">{metadata.title}</title>
      <meta key="description" name="description" content={metadata.description} />
      <meta key="robots" name="robots" content={metadata.robots} />
      <link key="canonical" rel="canonical" href={metadata.canonical} />

      {Object.entries(metadata.openGraph).map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}

      {Object.entries(metadata.twitter).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}

      {metadata.jsonLd.map((node, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          // Le JSON-LD provient de contenu statique type, jamais d'une entree utilisateur.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </Head>
  );
}
