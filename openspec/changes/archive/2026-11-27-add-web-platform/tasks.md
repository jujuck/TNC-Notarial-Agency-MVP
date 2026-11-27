# Tasks

Chaque tâche est un micro-commit : un seul objectif, un message Conventional Commit, une vérification avant de commiter. Ne jamais regrouper plusieurs tâches dans un même commit. Toutes les commandes s'exécutent dans les conteneurs Docker.

## 1. Socle Next.js et configuration

- [x] 1.1 Créer `web/` : `package.json`, `tsconfig.json`, `next.config.js`, `next-env.d.ts`, configuration ESLint 9, Vitest, `.gitignore`, `.dockerignore` — commit `chore(web): bootstrap Next.js Pages Router` — vérifier `npm ci` puis `npm run build` avec une page d'accueil minimale.
- [x] 1.2 Ajouter `_app.tsx`, `_document.tsx`, `styles/globals.css` et les composants de layout public avec `.site`, lien d'évitement, `header`, `main`, `footer` — commit `feat(web): add app shell and scoped styles` — vérifier que le CSS global ne contient aucun sélecteur nu et que le build passe.
- [x] 1.3 Ajouter `lib/site.ts` (validation de `NEXT_PUBLIC_SITE_URL`, `absoluteUrl`) et `lib/api.ts` (base navigateur `/api/v1`, base serveur `API_INTERNAL_URL/api/v1`, `credentials: 'include'`, parsing Problem Details) avec tests unitaires — commit `feat(web): add site config and API client` — vérifier `npm test` et `npm run typecheck`.
- [x] 1.4 Ajouter `components/Seo.tsx` : title, description, canonical, Open Graph, Twitter, JSON-LD, meta robots `noindex, nofollow` constante, sans prop de désactivation ; tests unitaires — commit `feat(web): add SEO component with permanent noindex` — vérifier que les tests couvrent toutes les balises et l'absence de doublon.

## 2. Accueil, robots et sitemap

- [x] 2.1 Ajouter `content/home.ts` et `pages/index.tsx` : `getStaticProps` avec `revalidate`, contenu statique, un seul `h1`, sections, JSON-LD `Organization`/`Notary`/`WebSite`, accessibilité de base — commit `feat(web): add ISR home page` — vérifier le build API arrêtée et la présence des balises SEO dans le HTML.
- [x] 2.2 Ajouter `public/robots.txt` (`User-agent: *`, `Allow: /`, sans `Disallow: /` ni `Sitemap:`) et `next-sitemap.config.js` (`generateRobotsTxt: false`, `generateIndexSitemap: false`, exclusion `/admin` et `/admin/*`) avec script `postbuild`, plus `scripts/dev-sitemap.mjs` en `predev` (`next-sitemap` exige un build) — commit `feat(seo): add static robots and sitemap` — vérifier que `/sitemap.xml` contient l'accueil, exclut `/admin`, et que `robots.txt` n'est pas écrasé.
- [x] 2.3 Ajouter dans `next.config.js` les en-têtes `X-Robots-Tag: noindex, nofollow` sur `/:path*` et `Cache-Control: no-store` sur `/admin/:path*` — commit `feat(seo): add noindex headers and admin no-store` — vérifier par `curl -I` sur `/`, un asset `_next/static`, `/sitemap.xml`, `/robots.txt` et `/admin`.
- [x] 2.4 Rédiger `docs/seo.md` (stratégie, deux couches de noindex, robots.txt, sitemap, JSON-LD, limite Lighthouse, absence de soumission aux moteurs) et passer le statut SEO à « fait » dans `docs/README.md` — commit `docs: document SEO and permanent noindex` — vérifier que chaque commande et chaque en-tête documentés existent.

## 3. Coquille admin et fake auth

- [x] 3.1 Ajouter les dépendances `react-admin`, `@mui/material`, `@emotion/react`, `@emotion/styled` et créer `admin/AdminApp.tsx`, `admin/fakeAuthProvider.ts`, `admin/fakeDataProvider.ts`, `pages/admin/[[...slug]].tsx` avec `next/dynamic` `ssr: false`, `Dashboard`, login factice et aucune resource — commit `feat(admin): add client-only admin shell with fake auth` — vérifier le login, le logout, la persistance de `demo_session` et l'absence d'appel `/api`.
- [x] 3.2 Ajouter `proxy.ts` (convention Next.js 16, ex-`middleware.ts`) sur `/admin/:path*` : laisser passer `/admin/login`, rediriger vers `/admin/login?from=...` sans `auth_token` ni `demo_session` ; tests unitaires de la décision — commit `feat(admin): add admin navigation proxy` — vérifier la redirection sans cookie et l'accès avec `demo_session`.
- [x] 3.3 Vérifier l'isolation : React Admin et MUI absents des chunks de l'accueil, HTML initial de `/admin` sans contenu admin, CSS global sans effet sur MUI — commit `test(admin): verify shell isolation and no-store` — vérifier les chunks, le HTML initial et l'en-tête `Cache-Control: no-store`.

## 4. Docker, proxy et documentation d'architecture

- [x] 4.1 Ajouter `infra/docker/web/Dockerfile` multi-stage (dépendances, build avec `ARG NEXT_PUBLIC_SITE_URL`, runtime standalone non-root, cache ISR inscriptible) et les exclusions de build dans le `.dockerignore` racine — commit `feat(infra): add Next.js standalone image` — vérifier `docker compose build web` et le démarrage de `node server.js`.
- [x] 4.2 Ajouter le service `web` dans `compose.yaml`, `compose.override.yaml` (mode dev, volumes, HMR) et `compose.prod.yaml` avec `API_INTERNAL_URL=http://nginx` et `NEXT_PUBLIC_SITE_URL` en build arg — commit `feat(infra): add web service to Compose` — vérifier `docker compose config` et l'absence de port web publié en production.
- [x] 4.3 Mettre à jour `infra/docker/nginx/default.conf` : `/api` inchangé vers PHP-FPM, `/` vers `web:3000`, en-têtes de proxy, `Upgrade`/`Connection` pour le HMR, `X-Robots-Tag` limité à `/api` — commit `feat(infra): proxy Next.js through Nginx` — vérifier `nginx -t`, `GET /` via Next et `GET /api/v1/health` via l'API.
- [x] 4.4 Ajouter les cibles Makefile `web-build`, `web-lint`, `web-typecheck`, `web-test` et compléter `infra/scripts/smoke.sh` (accueil, noindex, robots, sitemap, admin no-store, API santé) — commit `chore(infra): add web commands and smoke checks` — vérifier `make web-build`, `make web-test` et `make smoke`.
- [x] 4.5 Mettre à jour `docs/architecture.md` (web, Compose, proxy, variables, commandes, fake auth), ajouter `docs/adr/0003-noindex-permanent.md` et une entrée d'annexe constatant le remplacement de `SITE_INDEXABLE=false` — commit `docs: document web platform and noindex decision` — vérifier que l'architecture, l'ADR et l'annexe racontent la même décision.

## 5. Intégration et vérification

- [x] 5.1 Exécuter dans les conteneurs `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, puis `docker compose build`, `docker compose up -d` et `make smoke` — commit `test(web): verify SEO, proxy and admin shell` — vérifier que toutes les commandes passent et que les healthchecks sont verts.
- [x] 5.2 Vérifier les critères d'acceptation transverses : noindex sur page, asset, sitemap et robots ; `robots.txt` sans `Disallow: /` ni `Sitemap:` ; `/admin` sans contenu admin initial et avec `no-store` ; `/api/v1/health` toujours `200` ; absence de React Admin/MUI dans les bundles publics — commit `test(web): verify isolation and rollback` — vérifier chaque point par `curl`, inspection des chunks et `git status --short`.
- [x] 5.3 Vérifier le retour arrière : arrêter et supprimer les conteneurs et fichiers ajoutés sans supprimer les volumes ; ne jamais exécuter `docker compose down -v`, `docker volume rm` ou `docker system prune` — commit `test(web): verify rollback procedure` — vérifier que la base MySQL et ses volumes restent intacts.

## Workflow follow-up

- Exécuter `openspec validate add-web-platform --strict`.
- Archiver le change après revue et validation.
- Ne jamais pousser sur la branche principale ni merger une PR.
