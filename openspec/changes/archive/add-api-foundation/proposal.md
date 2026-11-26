# Proposal

## Why

Le dépôt ne contient encore aucun backend. PHP n'étant pas installé sur le poste, il faut un socle API exécutable entièrement sous Docker, capable de valider la chaîne Nginx → PHP-FPM → Slim → MySQL et de servir de base aux prochains changes (authentification BO, annonces).

Ce change est volontairement limité à l'infrastructure et aux templates : il valide Docker, Slim, la configuration, les erreurs et les logs avant d'ajouter la sécurité métier et les routes.

## What Changes

- Ajouter les répertoires `api/` et `infra/` au monorepo existant.
- Compléter `docs/` avec `architecture.md` et `docs/adr/`, puis mettre à jour le statut dans `docs/README.md`.
- Ajouter Docker Compose : Nginx en frontal, PHP-FPM, MySQL 8.4, healthchecks et variables d'environnement.
- Bootstrapper Slim 4 : front controller, PHP-DI, middlewares, routes versionnées `/api/v1`.
- Exposer deux routes techniques : `GET /api/v1/health` (liveness) et `GET /api/v1/health/ready` (readiness avec vérification MySQL).
- Normaliser les erreurs en Problem Details (RFC 9457) avec `request_id`.
- Configurer Monolog en JSON sur stdout, sans données personnelles ni secrets.
- Ajouter les en-têtes de sécurité et `X-Robots-Tag: noindex` côté Nginx.
- Fournir les templates `JwtService` et `AuthMiddleware` : JWT HS256 en cookie `HttpOnly`, sans refresh ni révocation, non branchés à une route.
- Ajouter PHPUnit, PHPStan, PHP-CS-Fixer et une CI GitHub Actions.
- Documenter l'architecture, l'ADR « auth cookie MVP » et un contrat OpenAPI limité au health.

**Hors périmètre** : tables, migrations, seed, routes de login, gestion des utilisateurs, annonces, upload, mailer, RDV, contact, front Next.js, TLS de production.

Aucun changement cassant.

## Capabilities

### New Capabilities

- `api-foundation` : socle HTTP/JSON de l'API Slim — routage versionné, configuration, erreurs, logs, santé, en-têtes de sécurité et runtime Docker.

### Modified Capabilities

Aucune : il n'existe pas encore de spec dans le projet.

## Impact

- **Documentation** : `docs/` existe déjà ; ajout de `architecture.md`, du répertoire `adr/` et mise à jour de `docs/README.md`. Aucun contenu existant n'est supprimé.
- **API Slim** : création de `api/`, aucune modification d'un code existant.
- **MySQL** : service Docker et vérification de connexion ; aucun schéma, aucune table.
- **Docker** : nouveaux Dockerfiles, configuration Nginx et Compose dev/prod.
- **Frontend Next.js** : aucun impact ; il consommera l'API dans un change ultérieur.
- **Dépendances** : `slim/slim`, `slim/psr7`, `php-di/php-di`, `monolog/monolog`, `firebase/php-jwt` ; en dev `phpunit`, `phpstan`, `php-cs-fixer`. `respect/validation` et `phinx` seront ajoutés avec les annonces.
- **Migrations** : aucune.
- **Retour arrière** : supprimer les fichiers et conteneurs ajoutés. Aucune donnée métier ni volume à supprimer ; ne jamais exécuter `docker compose down -v`.
- **Risques assumés** : JWT sans refresh ni révocation, CSRF via `SameSite`/`Origin`, un seul admin en variable d'environnement, TLS reporté. Ces compromis seront documentés dans l'ADR et défendus comme choix MVP.
