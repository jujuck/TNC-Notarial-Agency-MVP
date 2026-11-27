# Proposal

## Why

Le socle API Slim est en place, mais le dépôt n'a pas encore de frontend. Il faut valider la chaîne Nginx → Next.js → navigateur, la couche SEO complète et l'invariant noindex permanent avant d'ajouter les pages de contenu et les fonctionnalités métier.

Ce change livre un walking skeleton : une page d'accueil publique rendue côté serveur, une coquille admin client-only avec authentification factice, et le socle Docker/SEO qui servira aux changes suivants. Il permet de démontrer la maîtrise SEO sans jamais exposer le site à l'indexation.

## What Changes

- Ajouter `web/` : application Next.js Pages Router en TypeScript, `output: 'standalone'`, `reactStrictMode: true`, `poweredByHeader: false`.
- Ajouter la page d'accueil publique en ISR (`getStaticProps` + `revalidate`), avec contenu statique TypeScript, layout public `.site` et accessibilité de base.
- Ajouter le composant `Seo` : title, description, canonical, Open Graph, Twitter card, JSON-LD, et `<meta name="robots" content="noindex, nofollow">` **constant**, sans prop ni variable de désactivation.
- Ajouter `X-Robots-Tag: noindex, nofollow` via `next.config.js` `headers()` sur `/:path*`, et `Cache-Control: no-store` sur `/admin/:path*`.
- Ajouter `public/robots.txt` statique (`User-agent: *`, `Allow: /`, ni `Disallow: /` ni ligne `Sitemap:`) et un `sitemap.xml` généré par `next-sitemap` en postbuild (`generateRobotsTxt: false`), non référencé dans `robots.txt`.
- Ajouter la coquille admin `/admin/[[...slug]]` client-only (`ssr: false`) avec React Admin + MUI, un login factice, un cookie de démonstration `demo_session` et un middleware qui redirige vers `/admin/login` sans session.
- Ajouter `lib/api.ts` : côté navigateur `/api/v1/...` avec `credentials: 'include'`, côté serveur `${API_INTERNAL_URL}/api/v1/...`.
- Ajouter le Dockerfile standalone, le service Compose `web`, et le routage Nginx : `/api` → API, `/` → Next, avec `API_INTERNAL_URL=http://nginx` et le support HMR en développement.
- Ajouter `docs/seo.md`, un ADR « noindex permanent », mettre à jour `docs/architecture.md`, `docs/README.md` et consigner la décision dans l'annexe.
- **BREAKING** (infrastructure) : Nginx ne renvoie plus `404` sur `/`, il proxifie vers Next. L'API et ses routes `/api/v1` restent inchangées ; le `X-Robots-Tag` de Nginx est conservé uniquement sur `/api` pour ne pas casser la spec API existante.

**Hors périmètre** : autres pages publiques (étude, notaires, domaines, honoraires, actualités, FAQ, contact, RDV, simulateur, annonces, espace client, carrières, glossaire, plan du site), vrai `authProvider`, vrai `dataProvider`, resources React Admin, routes API métier, migrations MySQL, protection d'accès réelle et bandeau « démo ».

Aucune migration de base de données.

## Capabilities

### New Capabilities

- `web-platform` : socle Next.js Pages Router, configuration, styles scopés, client API, runtime Docker standalone et intégration au proxy.
- `public-site` : page d'accueil publique ISR, layout public, accessibilité de base et contenu statique.
- `seo` : métadonnées complètes, canonical, Open Graph, Twitter, JSON-LD, noindex permanent, `robots.txt`, sitemap et en-têtes HTTP.
- `admin-console` : coquille React Admin client-only, login factice, middleware de navigation, isolation CSS et bundles.

### Modified Capabilities

Aucune : il n'existe pas encore de spec frontend dans le projet. La spec API existante n'est pas modifiée ; son en-tête `X-Robots-Tag` reste assuré côté Nginx sur `/api`.

## Impact

- **Frontend Next.js** : création de `web/`, aucune modification d'un frontend existant.
- **API Slim** : aucun changement de contrat, aucune route ajoutée. `X-Robots-Tag` reste appliqué par Nginx sur `/api`.
- **MySQL** : aucune table, aucune migration.
- **Docker** : nouveau service `web`, nouveau Dockerfile, mise à jour de Nginx, Compose dev/prod et Makefile.
- **Documentation** : ajout de `docs/seo.md` et `docs/adr/0003-noindex-permanent.md` ; mise à jour de `docs/architecture.md`, `docs/README.md` et de l'annexe.
- **Dépendances** : `next`, `react`, `react-dom`, `react-admin`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `next-sitemap` ; en dev `typescript`, `eslint`, `vitest`, Testing Library, `jsdom`. Vérifier les CVE et la compatibilité avant ajout ; `next-sitemap@4.2.3` est ancien et doit être audité.
- **Migrations** : aucune.
- **Retour arrière** : supprimer `web/`, le service `web`, les modifications Nginx/Compose/Makefile et les documents ajoutés. Aucune donnée métier ni volume à supprimer ; ne jamais exécuter `docker compose down -v`, `docker volume rm` ou `docker system prune`.
- **Risques assumés** : le noindex pénalise l'audit SEO de Lighthouse ; le login factice n'est pas une protection ; `next-sitemap` est ancien ; l'accueil ne dépend pas de l'API ; le header noindex doit être vérifié sur les assets statiques.
