# Architecture

Socle de l'API REST/JSON de l'étude notariale. Ce document décrit le runtime
Docker, l'organisation du code, la configuration, les erreurs, les logs, la
santé et les templates d'authentification du change `add-api-foundation`.

## Périmètre

Inclus :

- Nginx en frontal, PHP-FPM, MySQL 8.4 sous Docker Compose.
- Slim 4 + PHP-DI, routes versionnées sous `/api/v1`.
- Deux routes techniques : `GET /api/v1/health` et `GET /api/v1/health/ready`.
- Erreurs RFC 9457, identifiant de requête, logs JSON sur stdout.
- Templates `JwtService` et `AuthMiddleware`, non branchés à une route.
- PHPUnit, PHPStan niveau 8, PHP-CS-Fixer, CI GitHub Actions.

Exclus (changes ultérieurs) : tables et migrations, login, comptes utilisateurs,
annonces, upload, mailer, RDV, contact, front Next.js, TLS de production.

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
├── infra/
│   ├── docker/
│   │   ├── api/               # Dockerfile, php.ini, pool PHP-FPM
│   │   ├── mysql/             # my.cnf
│   │   └── nginx/             # default.conf
│   └── scripts/smoke.sh
├── compose.yaml               # base
├── compose.override.yaml      # développement (auto-chargé)
├── compose.prod.yaml          # production
└── .env.example
```

## Runtime Docker

Chaîne : `client → Nginx :8080 → PHP-FPM :9000 → MySQL :3306`.

- Nginx ne sert que `/api` ; toute autre URL renvoie `404`. Le front Next.js
  sera ajouté dans un change ultérieur.
- MySQL reste sur le réseau interne. En développement, le port `3307` est
  publié sur `127.0.0.1` uniquement ; la configuration de production ne publie
  aucun port.
- Le Dockerfile est multi-stage : dépendances Composer (prod et dev), puis
  `php:8.4-fpm-alpine` avec `pdo_mysql`, `mbstring`, `fileinfo` et `opcache`.
- `clear_env = no` dans le pool PHP-FPM permet à Compose d'injecter les
  variables d'environnement.
- Healthchecks : connexion TCP sur le port PHP-FPM (`fsockopen`, sans client
  FastCGI additionnel), `GET /api/v1/health` via Nginx, `mysqladmin ping`.

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

`Settings::fromEnvironment()` valide tout au démarrage. Une variable manquante,
un port invalide, un secret trop court, ou `APP_DEBUG=true` avec
`APP_ENV=production` provoquent l'arrêt du processus avec un code non nul. Le
message d'erreur ne contient que le nom de la variable, jamais sa valeur.

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

Nginx ajoute sur toutes les réponses :

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `X-Frame-Options: DENY`
- `X-Robots-Tag: noindex, nofollow`

Pas de CORS : l'API et le front partageront le même origin.

## Commandes

Toutes les commandes passent par Docker ; PHP n'est pas requis sur le poste.

```bash
cp .env.example .env          # puis remplacer les valeurs
make build                    # construire les images
make up                       # démarrer Nginx, PHP-FPM et MySQL
make smoke                    # smoke test HTTP
make test                     # PHPUnit
make stan                     # PHPStan niveau 8
make cs                       # PHP-CS-Fixer en vérification
make cs-fix                   # appliquer le style
make sh                       # shell dans le conteneur API
make down                     # arrêter la stack
```

Production :

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d --build
```

Vérifications manuelles :

```bash
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

La CI `.github/workflows/api-ci.yml` exécute Composer, PHPUnit, PHPStan,
PHP-CS-Fixer, `composer audit` et le build Docker.

## Retour arrière

Arrêter et supprimer les conteneurs et les fichiers ajoutés par ce change.
Aucune donnée métier n'existe encore. Ne jamais exécuter
`docker compose down -v`, `docker volume rm` ou `docker system prune`.
