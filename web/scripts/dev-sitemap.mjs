#!/usr/bin/env node
/**
 * Genere `public/sitemap.xml` en developpement.
 *
 * `next-sitemap` exige `.next/build-manifest.json`, donc il ne peut tourner
 * qu'apres `next build`. En dev (`next dev`), ce script derive les routes
 * statiques du dossier `pages/` pour que `/sitemap.xml` soit disponible sans
 * build. En production, `next-sitemap` reste le generateur (script postbuild).
 */
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pagesDir = path.join(root, 'pages');
const outputFile = path.join(root, 'public', 'sitemap.xml');
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080').replace(/\/+$/, '');

const EXCLUDED_DIRECTORIES = new Set(['api', 'admin']);
const EXCLUDED_PAGES = new Set(['404', '500', '_app', '_document', '_error', 'middleware']);
const PAGE_EXTENSION = /\.(tsx|ts|jsx|js)$/;

async function collectRoutes(directory, base = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
      continue;
    }

    const relative = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      routes.push(...(await collectRoutes(path.join(directory, entry.name), relative)));
      continue;
    }

    if (!PAGE_EXTENSION.test(entry.name) || entry.name.includes('[')) {
      continue;
    }

    const baseName = entry.name.replace(PAGE_EXTENSION, '');
    if (EXCLUDED_PAGES.has(baseName)) {
      continue;
    }

    let route = relative.replace(PAGE_EXTENSION, '');
    if (route === 'index') {
      route = '';
    } else if (route.endsWith('/index')) {
      route = route.slice(0, -'/index'.length);
    }

    routes.push(route === '' ? '/' : `/${route}`);
  }

  return routes;
}

function toAbsoluteUrl(route) {
  return new URL(route, `${siteUrl}/`).toString();
}

async function main() {
  const routes = [...new Set(await collectRoutes(pagesDir))].sort();

  const urls = routes
    .map((route) => `  <url>\n    <loc>${toAbsoluteUrl(route)}</loc>\n  </url>`)
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(outputFile, xml, 'utf8');
  console.log(`sitemap dev genere (${routes.length} URL) : ${outputFile}`);
}

main().catch((error) => {
  // Ne jamais bloquer `next dev` pour un sitemap : le smoke test signalera
  // l'absence du fichier.
  console.warn(`sitemap dev non genere : ${error.message}`);
});
