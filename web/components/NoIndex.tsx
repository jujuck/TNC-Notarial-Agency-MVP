import Head from 'next/head';

import { ROBOTS_NOINDEX } from './Seo';

/**
 * Metadonnees de l'espace d'administration : noindex permanent,
 * meme constante que les pages publiques.
 */
export function NoIndex() {
  return (
    <Head>
      <title key="title">Administration — démonstration</title>
      <meta
        key="description"
        name="description"
        content="Espace d’administration de démonstration, non indexable."
      />
      <meta key="robots" name="robots" content={ROBOTS_NOINDEX} />
    </Head>
  );
}
