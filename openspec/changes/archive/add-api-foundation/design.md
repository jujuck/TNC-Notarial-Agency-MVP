# Design

## Context

Voir `proposal.md` pour la motivation. Le dépôt ne contient encore aucun code applicatif ; `docs/` existe déjà. PHP n'est pas installé sur le poste, donc toutes les commandes passent par Docker. Le change doit rester un socle : aucune table, aucune route métier, uniquement des templates et l'infrastructure.

Contraintes structurantes : origin unique sous `/api`, Nginx + PHP-FPM + MySQL, pas de TLS en production dans ce change, pas de front Next.js à servir.

## Goals / Non-Goals

**Goals:**
- Obtenir un walking skeleton exécutable sous Docker.
- Valider la chaîne Nginx → PHP-FPM → Slim → MySQL.
- Poser les conventions d'erreurs, de logs, de configuration et de santé.
- Préparer les templates d'authentification sans les exposer.
- Installer les garde-fous qualité et la CI.

**Non-Goals:**
- Route de login, JWT émis, comptes utilisateurs.
- Tables, migrations, seed, annonces, upload.
- Mailer, RDV, contact, front Next.js.
- TLS et déploiement de production.
- Tests E2E.

## Decisions

### 1. Organisation du code

- Ajouter `api/` et `infra/` au monorepo ; `docs/` existe déjà.
- Structure par fonctionnalité, sans couches DDD : `Shared/`, `Health/`, `Auth/`.
- Un fichier `routes.php` par module, agrégé dans `config/routes.php`.

Alternatives écartées : découpage Domain/Application/Infrastructure (trop de cérémonie pour 3 annonces et un admin) ; application mono-fichier (difficile à faire évoluer).

### 2. Runtime Docker

- Nginx en frontal, PHP-FPM, MySQL 8.4.
- Nginx ne sert que `/api` dans ce change ; `/` sera ajouté avec le front.
- MySQL reste sur le réseau interne ; en dev, un port `3307` peut être publié, jamais en prod.
- Dockerfile multi-stage : étape Composer, puis `php:8.4-fpm-alpine` avec `pdo_mysql`, `mbstring`, `fileinfo`, `opcache`.
- Healthchecks Compose sur Nginx/PHP-FPM et MySQL.

Alternatives écartées : Caddy (plus simple mais non retenu), FrankenPHP (moins standard), serveur PHP intégré (dev uniquement, pas représentatif).

### 3. Slim et injection de dépendances

- Slim 4 + `slim/psr7` + PHP-DI.
- Les actions sont des callables résolus par le conteneur.
- Pas de `php-di/slim-bridge` : Slim résout déjà les classes via le conteneur.

Alternatives écartées : Symfony/Laravel (surdimensionnés), PHP natif (pas de PSR-7/PSR-15), conteneur maison.

### 4. Configuration

- Variables d'environnement injectées par Docker Compose ; pas de `.env` chargé par PHP.
- `config/settings.php` retourne un objet `Settings` en lecture seule, construit par `Settings::fromEnvironment()` qui valide les valeurs critiques au démarrage.
- Variables principales : `APP_ENV`, `APP_DEBUG`, `APP_URL`, `DB_*`, `JWT_SECRET`.
- `.env.example` documente les valeurs attendues, sans secret réel.
- En production, `APP_DEBUG=true` fait échouer le démarrage.

Alternatives écartées : `vlucas/phpdotenv` (dépendance inutile puisque Compose injecte déjà), fichiers de config par environnement (risque de dérive).

### 5. Erreurs HTTP

- Format RFC 9457 `application/problem+json` : `type`, `title`, `status`, `detail`, `instance`, `request_id`.
- `type` vaut `about:blank` pour éviter d'inventer une URL de documentation.
- 404, 405 et 500 sont normalisés.
- En production, aucune stack trace ni message interne ; le détail complet part dans les logs.

Alternatives écartées : enveloppe maison `{success,error}`, erreurs HTML par défaut de Slim.

### 6. Logs

- Monolog en JSON sur stdout, format lisible en dev.
- Champs : `request_id`, méthode, chemin, statut, durée.
- Aucun corps de requête, mot de passe, token ou donnée personnelle.

Alternatives écartées : fichiers de log dans le conteneur (rotation et collecte plus difficiles), `error_log` natif (non structuré).

### 7. Santé

- `GET /api/v1/health` : liveness, ne dépend pas de MySQL.
- `GET /api/v1/health/ready` : `SELECT 1` sur MySQL ; 200 si OK, 503 sinon.
- Aucune information de configuration sensible dans les réponses.

Alternatives écartées : endpoint unique (ne distingue pas liveness et readiness), healthcheck externe uniquement.

### 8. Fondation d'authentification

- Template `JwtService` : JWT HS256, 8 h, claims `iss`, `sub`, `role`, `iat`, `exp`.
- Template `AuthMiddleware` : lit le cookie `auth_token`, vérifie le JWT, attache l'admin à la requête.
- Cookie : `HttpOnly`, `Secure` en production, `SameSite=Strict`, `Path=/`.
- Aucun refresh, aucune révocation, aucune table `users`.
- Un seul admin prévu via `ADMIN_EMAIL` et `ADMIN_PASSWORD_HASH` ; la route de login viendra dans un change ultérieur.
- CSRF prévu par `SameSite=Strict` + contrôle `Origin`/`Referer`, sans token.
- Rate limiting login prévu côté Nginx (`limit_req`), activé avec la route.

Alternatives écartées : sessions serveur (plus simples à révoquer, mais choix JWT conservé pour le MVP et l'évolution), EdDSA (gestion de clés supplémentaire), refresh token (rotation et stockage), token CSRF (complexité).

Les compromis sont assumés et documentés dans `docs/adr/0002-auth-cookie-mvp.md`.

### 9. En-têtes et CORS

- Nginx ajoute `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `X-Robots-Tag: noindex, nofollow`.
- Pas de CORS : l'API et le front partageront le même origin.
- Aucun `Access-Control-Allow-Origin: *`.

Alternatives écartées : middleware applicatif (moins fiable pour les réponses générées avant Slim), CORS permissif (inutile en same-origin).

### 10. Base de données

- Service MySQL uniquement ; aucune table, aucun index, aucune migration dans ce change.
- La readiness vérifie la connexion par `SELECT 1`.
- Le change annonces ajoutera `ads` et `ad_images` via Phinx, avec migrations réversibles.

Alternatives écartées : créer le schéma maintenant (hors périmètre), SQLite (incohérent avec la stack).

### 11. Tests et qualité

- PHPUnit : tests unitaires du JWT, tests d'intégration du health et des erreurs.
- PHPStan niveau 8, PHP-CS-Fixer.
- Pas d'E2E (décision D18) ; smoke tests HTTP dans le script de vérification.
- Toutes les commandes s'exécutent dans les conteneurs.

Alternatives écartées : E2E Playwright (coût/temps), niveau PHPStan plus bas (moins de rigueur).

### 12. CI, OpenAPI et documentation

- GitHub Actions : Composer, PHPUnit, PHPStan, PHP-CS-Fixer, build Docker.
- OpenAPI limité aux endpoints de santé.
- `docs/architecture.md`, `docs/adr/0002-auth-cookie-mvp.md`, mise à jour de `docs/README.md`.

Alternatives écartées : pas de CI (risque de régression), documentation différée (le socle doit être compréhensible).

## Risks / Trade-offs

- **JWT sans révocation** → TTL 8 h, HTTPS, `HttpOnly`, rotation du secret ; refresh/denylist plus tard.
- **CSRF sans token** → `SameSite=Strict` + `Origin` ; acceptable en same-origin, token si besoin.
- **Un seul admin en env** → pas d'audit ni de rôles ; acceptable pour la démo, table `users` plus tard.
- **HS256** → secret partagé ; acceptable pour un monolithe, EdDSA si d'autres services vérifient les tokens.
- **TLS reporté** → ne pas exposer la production sans HTTPS.
- **PHP absent** → tout passe par Docker ; devcontainer optionnel pour l'IDE.
- **Configuration Nginx** → smoke tests et healthchecks.
- **Aucun schéma DB** → la readiness ne valide que la connexion ; le change annonces ajoutera les migrations.
- **Calendrier D13** → réduire les options, pas le socle.

## Migration Plan

- Aucune migration de base de données.
- Déploiement : construire les images, démarrer Compose, attendre les healthchecks, exécuter le smoke test.
- Retour arrière : arrêter et supprimer les conteneurs et fichiers ajoutés ; aucun volume métier à supprimer. Ne jamais exécuter `docker compose down -v`.
- Les futures migrations Phinx seront précédées d'une sauvegarde MySQL.

## Open Questions

- Terminaison TLS : Nginx + certbot ou reverse proxy hôte ? Décision reportée, sans impact sur les specs.
- Devcontainer : à ajouter seulement si le confort IDE le justifie.
