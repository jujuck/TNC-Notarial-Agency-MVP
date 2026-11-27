# Architecture

Socle de l'API REST/JSON et du site Next.js de l'étude notariale. Ce document
décrit le runtime Docker, l'organisation du code, la configuration, les erreurs,
les logs, la santé, les templates d'authentification du change
`add-api-foundation`, puis le socle web du change `add-web-platform`.

## Périmètre

Inclus :

- Nginx en frontal, PHP-FPM, MySQL 8.4 et Next.js sous Docker Compose.
- Slim 4 + PHP-DI, routes versionnées sous `/api/v1`.
- Deux routes techniques : `GET /api/v1/health` et `GET /api/v1/health/ready`.
- Erreurs RFC 9457, identifiant de requête, logs JSON sur stdout.
- Templates `JwtService` et `AuthMiddleware`, non branchés à une route.
- PHPUnit, PHPStan niveau 8, PHP-CS-Fixer, CI GitHub Actions.
- Next.js Pages Router en sortie `standalone` : accueil ISR, composant SEO,
  noindex permanent, `robots.txt`, sitemap, coquille d'administration React Admin
  en authentification factice.

Exclus (changes ultérieurs) : tables et migrations, login réel, comptes
utilisateurs, annonces, upload, mailer, RDV, contact, espace client, carrières,
glossaire, plan du site, TLS de production.

## Arborescence

```text
.
├── api/
│   ├── config/
│   │   ├── bootstrap.php      # conteneur PHP-DI + application Slim
│   │   ├── dependencies.php   # définitions des services
│   │   ├── middleware.php     # ordre des middlewares
│   │   ├── routes.php         # agrégation des routes par module
│   │   └── settings.php       # lecture fail-fast de l'environnement
│   ├── openapi/openapi.yaml   # contrat limité au health
│   ├── public/index.php       # front controller
│   ├── src/
│   │   ├── Auth/              # templates JWT (non exposés)
│   │   ├── Health/            # liveness et readiness
│   │   └── Shared/            # configuration, erreurs, logs, base
│   ├── tests/                 # PHPUnit
│   ├── composer.json
│   ├── phpstan.neon
│   └── .php-cs-fixer.dist.php
├── web/
│   ├── pages/                 # accueil, _app, _document, admin/[[...slug]]
│   ├── components/            # Seo, NoIndex, layout public
│   ├── admin/                 # coquille React Admin et fake auth
│   ├── content/               # contenu statique typé
│   ├── lib/                   # site, client API, décision middleware
│   ├── styles/                # CSS global scopé et CSS Modules
│   ├── public/                # robots.txt, sitemap.xml, images
│   ├── proxy.ts               # redirection /admin → /admin/login (ex-middleware)
│   ├── next.config.js         # standalone, en-têtes noindex/no-store
│   ├── next-sitemap.config.js # postbuild sitemap
│   ├── scripts/               # dev-sitemap.mjs (predev)
│   └── package.json
├── infra/
│   ├── docker/
│   │   ├── api/               # Dockerfile, php.ini, pool PHP-FPM
│   │   ├── mysql/             # my.cnf
│   │   ├── nginx/             # default.conf + snippets d'en-têtes
│   │   └── web/               # Dockerfile Next.js standalone
│   └── scripts/smoke.sh
├── compose.yaml               # base
├── compose.override.yaml      # développement (auto-chargé)
├── compose.prod.yaml          # production
└── .env.example
```

## Runtime Docker

Deux chaînes partagent le même Nginx :

- pages et assets : `client → Nginx :8080 → Next.js :3000` ;
- API : `client → Nginx :8080 → PHP-FPM :9000 → MySQL :3306`.

- Nginx route `/api` vers PHP-FPM comme auparavant et `/` vers le service `web`.
  Le service `web` dépend de Nginx (santé), sans dépendance circulaire.
- Les appels serveur de Next vers l'API passent par `API_INTERNAL_URL=http://nginx`
  puis `/api/v1` : PHP-FPM ne parle pas HTTP, et `http://api:8080` n'existe pas
  dans cette stack. Le trafic reste sur le réseau Docker.
- MySQL reste sur le réseau interne. En développement, le port `3307` est
  publié sur `127.0.0.1` uniquement ; la configuration de production ne publie
  aucun port.
- Le Dockerfile API est multi-stage : dépendances Composer (prod et dev), puis
  `php:8.4-fpm-alpine` avec `pdo_mysql`, `mbstring`, `fileinfo` et `opcache`.
- Le Dockerfile web est multi-stage : dépendances npm, build `standalone` avec
  `NEXT_PUBLIC_SITE_URL` en build arg, puis runtime `node:24-alpine` non-root.
  Le cache ISR `.next/cache` est créé et appartient à l'utilisateur non-root.
- `clear_env = no` dans le pool PHP-FPM permet à Compose d'injecter les
  variables d'environnement.
- Healthchecks : connexion TCP sur le port PHP-FPM (`fsockopen`, sans client
  FastCGI additionnel), `GET /api/v1/health` via Nginx, `mysqladmin ping`, et
  `GET /` sur le service web.
- En développement, le service web exécute `npm run dev` avec la source montée ;
  Nginx transmet `Upgrade` et `Connection` pour le HMR de Next.js.

## Configuration

Toutes les valeurs viennent de l'environnement, injectées par Docker Compose.
Aucun `.env` n'est chargé par PHP.

| Variable              | Requis | Défaut                  | Rôle                                       |
| --------------------- | ------ | ----------------------- | ------------------------------------------ |
| `APP_ENV`             | non    | `development`           | `development`, `test` ou `production`      |
| `APP_DEBUG`           | non    | `false`                 | Active les détails d'erreur (jamais en prod) |
| `APP_URL`             | non    | `http://localhost:8080` | URL publique et `iss` des JWT              |
| `DB_HOST`             | oui    | —                       | Hôte MySQL                                 |
| `DB_PORT`             | oui    | —                       | Port MySQL (entier 1–65535)                |
| `DB_NAME`             | oui    | —                       | Base MySQL                                 |
| `DB_USER`             | oui    | —                       | Utilisateur MySQL                          |
| `DB_PASSWORD`         | oui    | —                       | Mot de passe MySQL                         |
| `JWT_SECRET`          | oui    | —                       | Secret HS256, 32 caractères minimum        |
| `JWT_TTL`             | non    | `28800`                 | Durée du JWT en secondes (8 h)             |
| `MYSQL_*`             | oui    | —                       | Variables attendues par l'image MySQL      |
| `HTTP_PORT`           | non    | `8080`                  | Port publié par Nginx                      |
| `DB_PORT_HOST`        | non    | `3307`                  | Port MySQL publié en développement         |
| `NEXT_PUBLIC_SITE_URL`| oui en prod | `http://localhost:8080` | URL publique : canonical, Open Graph, sitemap |
| `API_INTERNAL_URL`    | oui    | `http://nginx`          | Base des appels API côté serveur Next      |

`Settings::fromEnvironment()` valide tout au démarrage. Une variable manquante,
un port invalide, un secret trop court, ou `APP_DEBUG=true` avec
`APP_ENV=production` provoquent l'arrêt du processus avec un code non nul. Le
message d'erreur ne contient que le nom de la variable, jamais sa valeur.

Côté web, `NEXT_PUBLIC_SITE_URL` est validée au build : une valeur absente en
production fait échouer `npm run build` plutôt que de publier un canonical ou un
sitemap invalide. `API_INTERNAL_URL` n'est lue que côté serveur et n'est jamais
exposée aux bundles navigateur.

## Erreurs

Format RFC 9457, `Content-Type: application/problem+json` :

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "The requested resource was not found.",
  "instance": "/api/v1/unknown",
  "request_id": "0f8fad5b-d9cb-469f-a165-70867728950e"
}
```

- `404`, `405` (avec en-tête `Allow`) et `500` sont normalisés.
- En production, le `detail` d'une `500` est générique ; la trace complète est
  journalisée côté serveur.

## Logs

Monolog écrit sur stdout : JSON en production, format lisible en développement.
Chaque requête produit une entrée `request` avec `request_id`, `method`, `path`,
`status` et `duration_ms`. Aucun corps de requête, mot de passe, token ni donnée
personnelle n'est journalisé.

## Santé

- `GET /api/v1/health` : liveness, ne dépend pas de MySQL.
  `200 {"status":"ok"}`
- `GET /api/v1/health/ready` : exécute `SELECT 1`.
  - succès : `200 {"status":"ok","checks":{"database":"ok"}}`
  - échec : `503 {"status":"unavailable","checks":{"database":"error"}}`

Aucune information de configuration sensible n'est exposée.

## Site web (Next.js)

- Pages Router, TypeScript, `output: 'standalone'`, `reactStrictMode`, sans
  en-tête `X-Powered-By`.
- `pages/index.tsx` : accueil généré statiquement avec `getStaticProps` et
  `revalidate: 3600`. Le contenu vient de `content/home.ts`, typé, sans appel à
  l'API : le build réussit même API arrêtée.
- Le layout public enveloppe les pages dans `.site`, avec lien d'évitement,
  `header`, `main` et `footer`. Les styles des composants sont des CSS Modules ;
  le seul CSS global se limite à des variables et à un reset scopé sous `.site`,
  donc sans effet sur l'administration MUI.
- `components/Seo.tsx` émet title, description, canonical, Open Graph, Twitter
  et JSON-LD. La meta robots est une constante `noindex, nofollow`, sans prop ni
  variable de désactivation. Voir `docs/seo.md` et
  `docs/adr/0003-noindex-permanent.md`.
- `next.config.js` ajoute `X-Robots-Tag: noindex, nofollow` sur `/:path*` et
  `Cache-Control: no-store` sur `/admin/:path*`.
- `public/robots.txt` autorise tout, sans `Disallow: /` ni ligne `Sitemap:`.
  `next-sitemap` génère `public/sitemap.xml` au postbuild avec
  `generateRobotsTxt: false` et exclut `/admin*`. En développement,
  `next-sitemap` ne peut pas tourner sans `.next/build-manifest.json` : le
  script `predev` (`scripts/dev-sitemap.mjs`) dérive donc les routes statiques
  de `pages/` pour servir `/sitemap.xml` avant `next dev`.
- `/admin` et `/admin/*` : page catch-all qui monte React Admin côté client via
  `next/dynamic` avec `ssr: false`. Le HTML initial ne contient qu'un espace de
  chargement, et React Admin/MUI n'entrent pas dans les bundles publics.
- `proxy.ts` (convention Next.js 16, ex-`middleware.ts`) redirige `/admin/*`
  vers `/admin/login` sans cookie `auth_token` ni `demo_session`. C'est un
  confort de navigation, pas une frontière de sécurité.
- `lib/api.ts` : côté navigateur, base relative `/api/v1` et
  `credentials: 'include'`, sans en-tête `Authorization` ni token en stockage
  local ; côté serveur, base `API_INTERNAL_URL` + `/api/v1`. Les erreurs sont
  lues au format Problem Details.
- Aucune route `pages/api` sous `/api` : le préfixe appartient à l'API Slim.

## Administration (démonstration)

- `/admin/login` affiche un formulaire français. Toute paire email / mot de
  passe non vide ouvre la session de démonstration, sans appel API.
- Le login pose le cookie `demo_session`, drapeau de démonstration lisible par
  JavaScript (`Path=/admin`, `SameSite=Lax`, 8 h). Il ne contient ni JWT ni
  identité : ce n'est pas un token d'authentification.
- La coquille monte React Admin avec un `dataProvider` stub, un `authProvider`
  factice et **aucune resource**. Aucune requête vers les routes métier de l'API
  n'est émise.
- Le véritable `authProvider` (cookie `auth_token` `HttpOnly`, route
  `/api/v1/auth/me`) et les resources métier seront ajoutés dans un change
  dédié.

## Authentification (templates)

`JwtService` émet un JWT HS256 de 8 h avec les claims `iss`, `sub`, `role`,
`iat`, `exp`. `AuthMiddleware` lit le cookie `auth_token`, vérifie le token et
attache l'admin à la requête dans l'attribut `admin` ; il répond `401` en
Problem Details sinon.

Ces classes ne sont branchées à aucune route dans ce change :
`POST /api/v1/auth/login` renvoie `404`. Le cookie prévu est `HttpOnly`,
`SameSite=Strict`, `Path=/`, `Secure` en production. Les compromis (pas de
refresh, pas de révocation, admin unique en variables d'environnement) sont
documentés dans `docs/adr/0002-auth-cookie-mvp.md`.

## En-têtes de sécurité

Nginx ajoute sur les réponses API (`/api` et le front controller) :

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `X-Frame-Options: DENY`
- `X-Robots-Tag: noindex, nofollow`

Les réponses Next.js reçoivent les trois en-têtes de sécurité via Nginx, mais
pas `X-Robots-Tag` de Nginx : Next.js émet lui-même `X-Robots-Tag` et la meta
robots, pour que le SEO reste la responsabilité du front. Les snippets
`infra/docker/nginx/snippets/` évitent la perte d'en-têtes liée à l'héritage
`add_header` de Nginx.

Pas de CORS : l'API et le front partagent le même origin.

## Commandes

Toutes les commandes passent par Docker ; PHP n'est pas requis sur le poste.

```bash
cp .env.example .env          # puis remplacer les valeurs
make build                    # construire les images
make up                       # démarrer Nginx, PHP-FPM, MySQL et Next.js
make smoke                    # smoke test HTTP (API + site)
make test                     # PHPUnit
make stan                     # PHPStan niveau 8
make cs                       # PHP-CS-Fixer en vérification
make cs-fix                   # appliquer le style
make web-build                # build Next.js dans le conteneur web
make web-lint                 # ESLint du front
make web-typecheck            # vérification TypeScript
make web-test                 # tests unitaires Vitest
make sh                       # shell dans le conteneur API
make web-sh                   # shell dans le conteneur web
make down                     # arrêter la stack
```

Production :

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d --build
```

Vérifications manuelles :

```bash
curl -i http://localhost:8080/
curl -i http://localhost:8080/robots.txt
curl -i http://localhost:8080/sitemap.xml
curl -i http://localhost:8080/admin
curl -i -H 'Cookie: demo_session=1' http://localhost:8080/admin
curl -i http://localhost:8080/api/v1/health
curl -i http://localhost:8080/api/v1/health/ready
curl -i http://localhost:8080/api/v1/unknown
curl -i -X POST http://localhost:8080/api/v1/health
```

## Tests et qualité

- `api/tests/Shared/SettingsTest.php` : validation de configuration.
- `api/tests/Shared/ErrorTest.php` : 404, 405, 500 sans fuite d'information.
- `api/tests/Shared/RequestIdTest.php` : en-tête et corrélation des logs.
- `api/tests/Health/HealthTest.php` : liveness, readiness 200 et 503.
- `api/tests/Auth/JwtServiceTest.php` : token valide, expiré, signature
  invalide, issuer invalide.
- `api/tests/Auth/AuthMiddlewareTest.php` : 401, admin attaché, login non branché.
- `web/lib/site.test.ts` : validation et normalisation de `NEXT_PUBLIC_SITE_URL`.
- `web/lib/api.test.ts` : bases navigateur/serveur et parsing Problem Details.
- `web/components/Seo.test.ts` : métadonnées complètes et noindex constant.
- `web/lib/adminAccess.test.ts` : décision de redirection du proxy.
- `web/admin/fakeAuthProvider.test.ts` : login, logout, `checkAuth`, cookie non
  sensible.

La CI `.github/workflows/api-ci.yml` exécute Composer, PHPUnit, PHPStan,
PHP-CS-Fixer, `composer audit` et le build Docker. Le front s'appuie sur
`make web-lint`, `make web-typecheck`, `make web-test` et `make web-build`.

## Retour arrière

Arrêter et supprimer les conteneurs et les fichiers ajoutés par ce change :
`web/`, le service `web`, les snippets et la configuration Nginx, les cibles
Makefile et les documents ajoutés. Aucune migration de base n'est nécessaire :
le front ne modifie ni le schéma ni les données MySQL. Ne jamais exécuter
`docker compose down -v`, `docker volume rm` ou `docker system prune`.
