# Design

## Context

Voir `proposal.md` pour la motivation. Le dépôt contient déjà le socle API Slim, Nginx, PHP-FPM et MySQL. Nginx ne sert aujourd'hui que `/api` et renvoie `404` sur `/`. Aucun frontend n'existe encore.

Contraintes qui structurent l'approche :

- L'API est versionnée sous `/api/v1` et utilise Problem Details (RFC 9457).
- Nginx ajoute déjà `X-Robots-Tag: noindex, nofollow` à toutes ses réponses ; la spec API existante en dépend.
- L'authentification prévue est un JWT HS256 de 8 h dans un cookie `auth_token` `HttpOnly`, `SameSite=Strict`, sans refresh (ADR 0002). La route de login n'existe pas encore.
- Les commandes s'exécutent dans Docker ; PHP et Node ne sont pas requis sur le poste.
- Aucune image générée par IA, données fictives, aucun secret dans le dépôt.
- `docs/ux.md`, `docs/seo.md` et `docs/accessibilite.md` ne sont pas encore écrits.

## Goals / Non-Goals

**Goals:**

- Valider le runtime Next.js Pages Router en standalone derrière Nginx.
- Poser une couche SEO complète et réutilisable, avec un noindex permanent vérifiable.
- Livrer une page d'accueil ISR et une coquille admin client-only avec login factice.
- Préserver le contrat API existant et l'absence de CORS.
- Documenter la décision noindex et le socle web.

**Non-Goals:**

- Autres pages publiques, annonces, simulateur, RDV, contact, espace client, carrières, glossaire, plan du site.
- Vrai `authProvider`, vrai `dataProvider`, resources React Admin, routes API métier.
- Migrations MySQL, protection d'accès réelle, TLS de production, i18n, Search Console.
- Optimisation du score SEO Lighthouse, incompatible avec le noindex assumé.

## Decisions

### 1. Next.js Pages Router plutôt qu'App Router

- Next.js Pages Router, TypeScript, `output: 'standalone'`, `reactStrictMode: true`, `poweredByHeader: false`.
- Le Pages Router correspond au plan, simplifie le catch-all `/admin/[[...slug]]`, `getStaticProps`/ISR et le montage `next/dynamic` avec `ssr: false`.
- Alternatives écartées : App Router (moins aligné avec le plan et React Admin, davantage de concepts Server/Client Components pour une coquille) ; Vite SPA (pas de SSR/ISR, SEO dégradé) ; rendu PHP/Twig (ne démontre pas React).

### 2. Versions et compatibilité

| Paquet | Version cible | Justification |
| --- | --- | --- |
| Node.js | 24 LTS | Runtime supporté par Next 16, image `node:24-alpine` |
| Next.js | 16.4.6 | Dernière stable, Pages Router supporté |
| React / React DOM | 19.3.1 | Dernière stable, supportée par Next 16 et React Admin 5 |
| React Admin | 5.15.7 | Dernière stable, peer React 18/19, MUI 5/6/7/9 |
| MUI | 9.6.0 | Dernière stable, compatible React Admin 5.15 |
| Emotion | 11.x | Dépendance de MUI |
| TypeScript | 5.9.x | Écosystème Next/React Admin validé sur 5.x ; TS 7.0.2 est disponible mais sera réévalué après le typecheck |
| next-sitemap | 4.2.3 | Dernière version publiée ; ancienne, audit CVE et test de compatibilité obligatoires |
| ESLint | 9.x + `eslint-config-next` | Configuration flat alignée sur Next 16 |
| Vitest + Testing Library | dernières stables | Tests unitaires rapides, sans E2E |

- Alternatives écartées : Next 15 / React 18 / MUI 6 (socle conservateur, non retenu après arbitrage) ; TypeScript 7.0.2 immédiat (risque d'incompatibilité du plugin Next et des types React Admin) ; Jest (configuration ESM/Next plus lourde que Vitest).
- Toute dépendance ajoutée doit passer `npm audit` et une vérification de l'éditeur avant merge.

### 3. Composant `Seo` et métadonnées

- `components/Seo.tsx` utilise `next/head`. Props : `title`, `description`, `path`, `image?`, `type?`, `jsonLd?`. **Pas de prop `noindex`**.
- `lib/site.ts` lit `NEXT_PUBLIC_SITE_URL`, valide sa présence et normalise les slashs. `absoluteUrl(path)` produit le canonical.
- Le composant émet : `title`, meta description, canonical, `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`, et un script `application/ld+json`.
- La meta robots est une constante `ROBOTS_NOINDEX = 'noindex, nofollow'`, partagée avec la page admin. Chaque balise porte une `key` stable pour éviter les doublons.
- Le JSON-LD accepte un objet ou un tableau ; l'accueil fournit `Organization` + `Notary` et `WebSite`.
- Alternatives écartées : `next-seo` (dépendance supplémentaire, invariant noindex plus difficile à garantir) ; métadonnées dans `_document` (non spécifiques à la page) ; JSON-LD dans un composant séparé (duplication).

### 4. Noindex permanent en deux couches

- **Meta** : `Seo` émet toujours `<meta name="robots" content="noindex, nofollow">`. La page admin émet la même meta via un composant `NoIndex` ou directement dans `next/head`.
- **Header HTTP** : `next.config.js` `headers()` applique `X-Robots-Tag: noindex, nofollow` sur `/:path*`, donc aux pages, `_next/static`, images, `/sitemap.xml` et `/robots.txt`.
- **robots.txt** : fichier statique `public/robots.txt` avec `User-agent: *` et `Allow: /`. Pas de `Disallow: /` (un crawler bloqué ne lit pas le noindex) et pas de ligne `Sitemap:`.
- **Sitemap** : `next-sitemap` en postbuild avec `generateRobotsTxt: false`, `generateIndexSitemap: false`, `outDir: 'public'`, `exclude: ['/admin*', '/404', '/500']`. Il génère `/sitemap.xml` sans écraser `robots.txt`.
- Aucune variable `INDEXABLE`, `NEXT_PUBLIC_SEO_INDEXABLE` ou `SITE_INDEXABLE` n'est créée. La mention `SITE_INDEXABLE=false` de l'annexe §7.3 est historisée comme remplacée par cette décision.
- Alternatives écartées : variable d'environnement (contraire à l'invariant) ; `Disallow: /` (empêche la lecture du noindex et peut laisser l'URL dans les résultats via des liens entrants) ; basic auth/IP (hors périmètre) ; header SEO ajouté par le proxy (le plan réserve le SEO à Next, et Nginx le garde seulement pour `/api`).

### 5. Accueil ISR avec contenu statique

- `pages/index.tsx` utilise `getStaticProps` avec `revalidate: 3600` et un contenu typé dans `content/home.ts`.
- L'accueil ne dépend pas de l'API : le build fonctionne API arrêtée, et la démo reste stable.
- Le layout public est appliqué via `getLayout` : enveloppe `.site`, lien d'évitement, `header`, `main`, `footer`.
- Les liens de navigation pointent vers des ancres de la page (pas de routes inexistantes).
- Alternatives écartées : SSR pur (inutile pour un contenu statique) ; SSG sans revalidation (ne démontre pas l'ISR) ; contenu via API (API métier absente).

### 6. Coquille admin client-only et fake auth

- `pages/admin/[[...slug]].tsx` importe `admin/AdminApp` via `next/dynamic` avec `ssr: false` et un écran de chargement neutre. Le HTML initial ne contient aucun balisage React Admin.
- `admin/AdminApp.tsx` monte `<Admin basename="/admin" dataProvider={fakeDataProvider} authProvider={fakeAuthProvider} requireAuth>` avec un `Dashboard` de démonstration et **aucune resource**.
- `admin/fakeAuthProvider.ts` :
  - `login` accepte tout email et mot de passe non vides, pose `demo_session=1` (`Path=/admin`, `SameSite=Lax`, `Max-Age=28800`), sans appel API.
  - `logout` supprime `demo_session`.
  - `checkAuth` vérifie la présence de `demo_session` (cookie lisible, drapeau de démonstration, pas un token).
  - `getIdentity` retourne un administrateur fictif ; `getPermissions` retourne `undefined` ; `checkError` rejette sur `401`.
- `admin/fakeDataProvider.ts` est un stub qui renvoie des listes vides et rejette les mutations avec un message « non implémenté ». Il ne contacte jamais `/api`.
- Le routeur utilise l'historique navigateur par défaut de React Admin 5 (react-router) avec `basename="/admin"` pour des URLs `/admin/...` propres et compatibles avec le catch-all ; la prop `history` a été supprimée en React Admin 5.
- Le vrai `authProvider` (cookie `auth_token` HttpOnly, `/api/v1/auth/me`) et le vrai `dataProvider` seront ajoutés dans un change dédié.
- Alternatives écartées : pas de React Admin (l'utilisateur veut visualiser la coquille) ; vrai auth (API absente) ; hash history (URLs `#/`, moins alignées avec le plan) ; `ra-data-fakerest` (dépendance supplémentaire pour un stub vide).

### 7. Middleware de navigation

- `proxy.ts` avec `matcher: ['/admin/:path*']` (convention Next.js 16, ex-`middleware.ts`).
- Si le chemin est `/admin/login`, laisser passer.
- Sinon, si ni `auth_token` ni `demo_session` ne sont présents, rediriger vers `/admin/login?from=<path>`.
- Le middleware est un confort de navigation, pas une frontière de sécurité : l'API protègera les données. `auth_token` est HttpOnly et posé par l'API plus tard ; `demo_session` est temporaire.
- Alternatives écartées : aucun middleware (l'utilisateur a demandé la redirection) ; vérification JWT dans Next (secret partagé, duplication) ; redirection côté layout (plus fragile, flash de contenu).

### 8. Styles scopés

- CSS Modules pour les composants ; un seul fichier global `styles/globals.css` importé dans `_app.tsx`.
- Le global se limite aux variables CSS et à un reset sous `.site`. Aucun sélecteur nu (`button`, `input`, `h1`, etc.).
- Le layout public ajoute `.site` ; l'admin ne l'utilise pas, donc le reset public ne l'affecte pas.
- Alternatives écartées : Tailwind (hors plan) ; styled-components (dépendance et runtime supplémentaires) ; CSS global non scopé (risque de casser MUI).

### 9. Client API

- `lib/api.ts` :
  - navigateur : base `''`, préfixe `/api/v1`, `credentials: 'include'`, pas de header `Authorization` ;
  - serveur : base `process.env.API_INTERNAL_URL`, préfixe `/api/v1` ;
  - parse les erreurs Problem Details et expose un type d'erreur.
- `API_INTERNAL_URL` doit valoir `http://nginx` dans Compose : PHP-FPM n'est pas un serveur HTTP, et `http://api:8080` n'existe pas dans cette stack. Le trafic serveur Next → Nginx → PHP-FPM reste sur le réseau Docker.
- `NEXT_PUBLIC_SITE_URL` vaut `http://localhost:8080` en dev et l'URL HTTPS publique en prod.
- Alternatives écartées : `http://api:8080` (faux), `http://api:9000` (FastCGI, pas HTTP), URL publique pour les appels serveur (sortie inutile du réseau Docker).

### 10. Docker et reverse proxy

- `infra/docker/web/Dockerfile` multi-stage : dépendances, build avec `ARG NEXT_PUBLIC_SITE_URL`, runtime `node:24-alpine` non-root.
- Le runtime copie `.next/standalone`, `.next/static` et `public` (qui contient le sitemap généré). Le cache ISR `.next/cache` est créé et appartenant à l'utilisateur non-root.
- Compose ajoute le service `web` avec `API_INTERNAL_URL=http://nginx`, un healthcheck local sur `/`, et `NEXT_PUBLIC_SITE_URL` en build arg. Nginx dépend de `web` et `api`.
- En dev, le service web utilise `npm run dev` avec volumes et HMR ; Nginx transmet `Upgrade` et `Connection`.
- Nginx route `/api` vers PHP-FPM comme avant et `/` vers `web:3000`. Les en-têtes de sécurité restent globaux ; `X-Robots-Tag` est déplacé dans un snippet inclus uniquement sur `/api` pour préserver la spec API sans l'ajouter aux réponses Next.
- Alternatives écartées : `next start` (image plus lourde, sortie non standalone) ; Caddy/Traefik (hors stack) ; header `X-Robots-Tag` global (contraire au plan et redondant avec Next).

### 11. Tests et qualité

- Vitest + Testing Library pour `Seo` (balises, noindex constant), `authProvider` (login/logout/checkAuth), `lib/api` (bases navigateur/serveur) et la fonction de décision du middleware.
- Script smoke HTTP : accueil, en-têtes noindex, `robots.txt`, `sitemap.xml`, `/admin` no-store et redirection, `/api/v1/health`.
- Pas d'E2E (décision D18). Lighthouse CI pourra être ajouté plus tard, avec la limite SEO documentée.
- Alternatives écartées : Playwright (coût/temps) ; Jest (configuration plus lourde) ; tests manuels seuls (régression SEO).

### 12. Documentation

- `docs/seo.md` : stratégie SEO, deux couches de noindex, `robots.txt`, sitemap, JSON-LD, limite Lighthouse, absence de soumission aux moteurs.
- `docs/adr/0003-noindex-permanent.md` : décision, alternatives, conséquences, retour arrière.
- `docs/architecture.md` : ajout de `web/`, service Compose, proxy, variables, commandes, admin fake auth.
- `docs/README.md` : statut SEO passé à « fait ».
- Annexe : nouvelle entrée de session constatant que `SITE_INDEXABLE=false` est remplacé par le noindex permanent, sans réécrire l'historique.
- Alternatives écartées : documentation différée (la décision noindex doit être défendable en entretien) ; réécriture de l'annexe (perte de traçabilité).

## Risks / Trade-offs

- **Noindex et Lighthouse** → l'audit « page bloquée pour l'indexation » échouera. Mitigation : l'expliquer dans la démo et `docs/seo.md` ; ne pas retirer le noindex en production.
- **Fake auth non sécurisée** → aucune donnée réelle, aucun appel API, cookie `demo_session` non sensible. Mitigation : retirer le fake auth dès le change auth réel ; ne jamais s'appuyer dessus pour protéger des données.
- **`next-sitemap@4.2.3` ancien** → audit CVE et test avec Next 16. Mitigation : repli sur un script Node minimal générant `sitemap.xml` depuis une liste de routes si incompatibilité.
- **`X-Robots-Tag` sur les assets** → Next peut ne pas appliquer `headers()` à certains fichiers. Mitigation : vérifier par `curl` ; ajouter une entrée explicite `/_next/static/:path*` ou un middleware de secours si nécessaire.
- **`Cache-Control: no-store` sur `/admin`** → Next peut ajouter son propre cache. Mitigation : vérifier l'en-tête ; middleware de secours si conflit.
- **Fuite de React Admin/MUI dans le bundle public** → import statique accidentel. Mitigation : `next/dynamic` + `ssr: false`, vérification des chunks dans la tâche de validation.
- **`API_INTERNAL_URL` via Nginx** → dépendance runtime à Nginx, pas au démarrage. Mitigation : ne pas mettre de `depends_on` circulaire ; healthcheck web indépendant de l'API ; tester un appel serveur.
- **Build sans `NEXT_PUBLIC_SITE_URL`** → canonical/sitemap invalides. Mitigation : validation fail-fast dans `lib/site.ts`, valeur par défaut en dev Compose, valeur obligatoire en prod.
- **TypeScript 7** → compatibilité plugin Next/React Admin incertaine. Mitigation : pin 5.9, réévaluer après le typecheck.
- **ISR en conteneur non-root** → cache non inscriptible. Mitigation : créer `.next/cache` avec les bons droits dans l'image.
- **Cookie `demo_session` lisible par JS** → acceptable car ce n'est pas un token. Mitigation : ne jamais y mettre d'identité ni de secret ; le vrai `auth_token` reste HttpOnly.

## Migration Plan

- Aucune migration de base de données.
- Développement : renseigner `NEXT_PUBLIC_SITE_URL=http://localhost:8080`, construire les images, démarrer Compose, attendre les healthchecks, exécuter le smoke test.
- Production : construire avec l'URL HTTPS publique, démarrer `compose.yaml` + `compose.prod.yaml`, vérifier le healthcheck web, les en-têtes noindex et `/api/v1/health`, puis recharger Nginx.
- Retour arrière : supprimer `web/`, le service `web`, les modifications Nginx/Compose/Makefile et les documents ajoutés. Aucun volume métier n'est concerné ; ne jamais exécuter `docker compose down -v`, `docker volume rm` ou `docker system prune`.
- Les routes API et la base MySQL ne sont pas modifiées : le retour arrière du frontend ne nécessite aucune migration.
