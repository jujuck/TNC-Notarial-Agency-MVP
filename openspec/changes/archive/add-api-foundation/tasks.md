# Tasks

Chaque tâche est un micro-commit : un seul objectif, un message Conventional Commit, une vérification avant de commiter. Ne jamais regrouper plusieurs tâches dans un même commit. La branche `Architecture-applicative` existe déjà et couvre toute l'architecture.

## 1. Infrastructure Docker

- [x] 1.1 Créer `api/`, `infra/docker/{api,nginx,mysql}/`, `infra/scripts/` et `.dockerignore` — commit `chore(infra): create backend skeleton` — vérifier l'arborescence avec `find api infra -maxdepth 3`.
- [x] 1.2 Ajouter `infra/docker/api/Dockerfile` multi-stage (Composer puis PHP 8.4 FPM Alpine, extensions `pdo_mysql`, `mbstring`, `fileinfo`, `opcache`) — commit `feat(infra): add PHP-FPM Docker image` — vérifier avec `docker compose build api`.
- [x] 1.3 Ajouter `infra/docker/nginx/default.conf` : `/api` en FastCGI vers `api:9000`, `SCRIPT_FILENAME=/srv/api/public/index.php`, en-têtes de sécurité, `X-Robots-Tag`, `client_max_body_size` — commit `feat(infra): add Nginx API gateway` — vérifier avec `docker compose run --rm nginx nginx -t`.
- [x] 1.4 Ajouter `compose.yaml`, `compose.override.yaml` et `compose.prod.yaml` (Nginx, PHP-FPM, MySQL 8.4, healthchecks, réseau interne, aucun port DB publié en prod) — commit `feat(infra): add Docker Compose stack` — vérifier `docker compose config` et l'absence de `ports` MySQL dans la configuration prod.
- [x] 1.5 Ajouter `.env.example` et les cibles Makefile (`up`, `build`, `sh`, `test`, `stan`, `cs`, `smoke`) — commit `chore(infra): add environment template and Makefile` — vérifier que `make help` liste les cibles et que `docker compose config` accepte les variables.

## 2. Bootstrap Slim et configuration

- [x] 2.1 Créer `api/composer.json` avec `slim/slim`, `slim/psr7`, `php-di/php-di`, `monolog/monolog`, `firebase/php-jwt`, et les dev `phpunit`, `phpstan`, `php-cs-fixer` ; ajouter `api/phpunit.xml.dist` — commit `feat(api): add Slim dependencies and PHPUnit` — vérifier `docker compose run --rm api composer validate`, `composer install` et `vendor/bin/phpunit --version`.
- [x] 2.2 Créer `api/config/settings.php` : lecture des variables, validation fail-fast, refus de `APP_DEBUG=true` en production — commit `feat(api): add fail-fast configuration` — vérifier avec `SettingsTest` (variable manquante, debug interdit).
- [x] 2.3 Créer `api/config/dependencies.php`, `middleware.php` et `routes.php` : PHP-DI, ordre des middlewares, groupe `/api/v1` — commit `feat(api): add dependency injection and middleware pipeline` — vérifier que l'application démarre et que les routes sont enregistrées.
- [x] 2.4 Créer `api/public/index.php` : autoload, construction de l'app, chargement de la config et du conteneur, gestion des erreurs de bootstrap — commit `feat(api): add Slim front controller` — vérifier `php -l` et le démarrage du conteneur.
- [x] 2.5 Créer `api/src/Shared/JsonResponse.php`, `ProblemDetails.php` et le handler d'erreurs : 404, 405 et 500 en `application/problem+json` avec `request_id` — commit `feat(api): add Problem Details error handling` — vérifier avec `ErrorTest`.
- [x] 2.6 Créer `api/src/Shared/RequestIdMiddleware.php` et la configuration Monolog JSON stdout — commit `feat(api): add request correlation and JSON logs` — vérifier avec `RequestIdTest` que `X-Request-Id` est présent et que le log contient le même identifiant.
- [x] 2.7 Créer `api/src/Health/HealthAction.php` et `ReadyAction.php` : `GET /api/v1/health` et `GET /api/v1/health/ready` avec `SELECT 1` — commit `feat(api): add health endpoints` — vérifier avec `HealthTest` (200 et 503).
- [x] 2.8 Créer `api/openapi/openapi.yaml` limité aux endpoints de santé — commit `docs(api): add health OpenAPI contract` — vérifier que les chemins, méthodes et statuts correspondent aux tests et au spec.

## 3. Templates d'authentification

- [x] 3.1 Créer `api/src/Auth/JwtService.php` : HS256, 8 h, claims `iss/sub/role/iat/exp`, lecture de `JWT_SECRET` — commit `feat(auth): add JWT service template` — vérifier avec `JwtServiceTest` (token valide, expiré, signature invalide).
- [x] 3.2 Créer `api/src/Auth/AuthMiddleware.php` : lecture du cookie `auth_token`, vérification, attribut admin, 401 Problem Details — commit `feat(auth): add JWT cookie middleware template` — vérifier avec `AuthMiddlewareTest` et confirmer que `POST /api/v1/auth/login` renvoie 404 (aucune route branchée).

## 4. Qualité et CI

- [x] 4.1 Ajouter `api/phpstan.neon` au niveau 8 et corriger les erreurs — commit `chore(api): add PHPStan level 8` — vérifier `docker compose run --rm api vendor/bin/phpstan analyse`.
- [x] 4.2 Ajouter `api/.php-cs-fixer.dist.php` avec PER-CS 3.0 — commit `chore(api): add PHP-CS-Fixer configuration` — vérifier `docker compose run --rm api vendor/bin/php-cs-fixer fix --dry-run --diff`.
- [x] 4.3 Ajouter `.github/workflows/api-ci.yml` : Composer, PHPUnit, PHPStan, PHP-CS-Fixer, `composer audit`, build Docker — commit `ci(api): add quality and build workflow` — vérifier la syntaxe YAML et que les commandes correspondent aux cibles Makefile.

## 5. Documentation

- [x] 5.1 Rédiger `docs/architecture.md` : arborescence, runtime Docker, config, erreurs, logs, health, auth cookie, commandes ; mettre à jour `docs/README.md` — commit `docs: document API architecture` — vérifier que chaque commande documentée s'exécute.
- [x] 5.2 Rédiger `docs/adr/0002-auth-cookie-mvp.md` : JWT cookie HS256, absence de refresh/révocation, CSRF `SameSite`/`Origin`, admin unique, alternatives et évolution — commit `docs: add auth cookie MVP ADR` — vérifier que les compromis et le rollback sont explicites.

## 6. Intégration et vérification

- [x] 6.1 Ajouter `infra/scripts/smoke.sh` : health, 404, 405, en-têtes de sécurité — commit `test(api): add HTTP smoke script` — vérifier qu'il échoue si l'API est arrêtée puis passe après `docker compose up -d`.
- [x] 6.2 Démarrer la stack complète et vérifier `docker compose ps` (services healthy), `GET /api/v1/health` 200, route inconnue 404, méthode invalide 405, en-têtes de sécurité présents — commit `test(api): verify containerized runtime` — vérifier les sorties HTTP et les healthchecks.
- [x] 6.3 Vérifier la readiness : `GET /api/v1/health/ready` 200 avec MySQL, puis 503 après arrêt de `db` et redémarrage ; vérifier que `/api/v1/ads` et `/api/v1/auth/login` renvoient 404 et qu'aucune migration/table n'existe — commit `test(api): verify readiness and scope guard` — vérifier les codes HTTP et l'absence de fichiers de migration.
- [x] 6.4 Exécuter PHPUnit, PHPStan, PHP-CS-Fixer et `composer audit` dans les conteneurs ; vérifier le rollback (arrêt/suppression des conteneurs, aucun volume supprimé, aucune commande `down -v` dans les scripts) — commit `test(api): verify quality suite and rollback` — vérifier la suite complète et `git status --short`.

## Workflow follow-up

- La branche `Architecture-applicative` existe déjà et couvre toute l'architecture : ne pas créer de nouvelle branche ni de PR spécifique à ce change.
- Après chaque tâche : vérifier, puis commiter uniquement les fichiers concernés.
- Exécuter `openspec validate add-api-foundation --strict`.
- Archiver le change après revue.
