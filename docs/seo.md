# SEO

Stratégie SEO du site public de démonstration : métadonnées complètes,
noindex permanent, `robots.txt`, sitemap et données structurées.

## Principe

Le site est **complet techniquement** mais **volontairement non indexable**.
Il sert à démontrer la mise en œuvre d'un socle SEO sans jamais exposer la
démonstration dans les moteurs de recherche.

Conséquences assumées :

- les moteurs ne doivent pas indexer le site, ni le référencer ;
- le sitemap existe et est valide, mais n'est pas déclaré ;
- un audit Lighthouse SEO signalera un blocage d'indexation : c'est attendu.

Le noindex n'est pas un réglage temporaire. Il n'existe **aucune** variable,
prop ou option permettant de l'activer ou de le désactiver.

## Métadonnées par page

Chaque page publique utilise le composant `components/Seo.tsx`. Il émet :

| Élément          | Contenu                                                        |
| ---------------- | -------------------------------------------------------------- |
| `title`          | Titre unique et spécifique à la page                            |
| `description`    | Meta description propre à la page                               |
| `robots`         | `noindex, nofollow` (constante `ROBOTS_NOINDEX`)                |
| `canonical`      | URL absolue construite depuis `NEXT_PUBLIC_SITE_URL`            |
| Open Graph       | `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:locale` |
| Twitter          | `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image` |
| JSON-LD          | Un ou plusieurs nœuds `application/ld+json`                     |

Les props acceptées sont `title`, `description`, `path`, `image`, `type` et
`jsonLd`. Il n'existe **pas** de prop `noindex` : le noindex est toujours émis.

Chaque balise porte une `key` React stable pour éviter les doublons dans le
`<head>`.

## Noindex en deux couches

Le noindex est appliqué à deux niveaux indépendants, pour qu'aucun oubli de
composant ne suffise à rendre une page indexable.

1. **Meta HTML** : `<meta name="robots" content="noindex, nofollow">`, émise par
   `Seo` sur les pages publiques et par la page admin.
2. **En-tête HTTP** : `X-Robots-Tag: noindex, nofollow` sur `/:path*` via
   `headers()` dans `web/next.config.js`. Cela couvre les pages, les fichiers
   `/_next/static`, les images, `/sitemap.xml` et `/robots.txt`.

Les pages `/admin` reçoivent en plus `Cache-Control: no-store`.

Le reverse proxy Nginx ne participe pas au SEO des pages : il conserve
`X-Robots-Tag` uniquement sur `/api`, conformément au socle API existant.

## `robots.txt`

Fichier statique `web/public/robots.txt` :

```text
User-agent: *
Allow: /
```

Règles :

- pas de `Disallow: /` : un crawler bloqué ne lit pas la meta noindex et peut
  tout de même conserver l'URL à partir de liens entrants ;
- pas de ligne `Sitemap:` : le sitemap n'est pas annoncé ;
- le fichier n'est jamais généré ni écrasé par `next-sitemap`
  (`generateRobotsTxt: false`).

## Sitemap

Deux générateurs, selon le mode :

- **build / pré-prod / prod** : `next-sitemap` tourne en `postbuild` et produit
  `public/sitemap.xml` à partir de `.next/build-manifest.json` ;
- **dev** : `next-sitemap` exige un build préalable, donc `predev` lance
  `scripts/dev-sitemap.mjs`, un générateur minimal qui dérive les routes
  statiques de `pages/` (hors `admin`, `api`, `_app`, `_document`, routes
  dynamiques). Le sitemap est ainsi servi par `next dev` sans build complet.

Configuration `next-sitemap` :

- `siteUrl` vient de `NEXT_PUBLIC_SITE_URL`, normalisée sans slash final ;
- `generateRobotsTxt: false` protège le `robots.txt` statique ;
- `generateIndexSitemap: false` produit un sitemap unique ;
- `/admin`, `/admin/*`, `/404` et `/500` sont exclus.

Le sitemap n'est **pas** soumis à Search Console ni à Bing Webmaster Tools, et
aucun lien entrant public ne doit être créé vers le site de démonstration.

## URL canonique

`lib/site.ts` valide `NEXT_PUBLIC_SITE_URL` et normalise les slashs.
`absoluteUrl('/')` produit `https://exemple.test/` ; un chemin interne est
normalisé sans slash final superflu.

En production, l'absence de `NEXT_PUBLIC_SITE_URL` fait échouer le build : un
canonical ou un sitemap invalide ne doit pas être publié silencieusement.

## Données structurées

L'accueil fournit trois nœuds JSON-LD construits au build :

- `Organization` : nom, description, URL, courriel, téléphone, adresse ;
- `Notary` (`LocalBusiness`) : rattachement à l'organisation, horaires ;
- `WebSite` : nom, URL, langue `fr-FR`, éditeur.

Les données sont fictives et statiques. Aucune entrée utilisateur n'est injectée
dans le JSON-LD.

## Images de partage

La démonstration utilise `public/images/partage.svg` comme image Open Graph par
défaut. Les plateformes sociales n'acceptent généralement pas le SVG : en
production réelle, remplacer par un PNG ou JPEG en 1200 × 630 et mettre à jour
la prop `image` du composant `Seo`.

## Vérifications

```bash
curl -sI http://localhost:8080/ | grep -i x-robots-tag
curl -sI http://localhost:8080/images/partage.svg | grep -i x-robots-tag
curl -s  http://localhost:8080/robots.txt
curl -s  http://localhost:8080/sitemap.xml
curl -sI http://localhost:8080/admin | grep -i -E 'x-robots-tag|cache-control'
```

Attendu :

- `X-Robots-Tag: noindex, nofollow` sur chaque réponse Next ;
- `robots.txt` sans `Disallow: /` ni `Sitemap:` ;
- `sitemap.xml` sans URL `/admin` ;
- `/admin` avec `Cache-Control: no-store`.

## Ce qu'il ne faut pas faire

- Ajouter `Disallow: /` dans `robots.txt`.
- Référencer le sitemap dans `robots.txt`.
- Introduire `INDEXABLE`, `NEXT_PUBLIC_SEO_INDEXABLE`, `SITE_INDEXABLE` ou un
  équivalent.
- Retirer le noindex pour « améliorer » le score Lighthouse.
- Soumettre le site ou son sitemap à un moteur de recherche.

La décision est tracée dans `docs/adr/0003-noindex-permanent.md`.
