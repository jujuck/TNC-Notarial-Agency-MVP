# ADR 0002 — Authentification par cookie JWT pour le MVP

- Statut : accepté
- Date : 2026-11-25
- Contexte : change `add-api-foundation`

## Contexte

Le back-office doit être protégé par une authentification. Le MVP prévoit un
seul administrateur, pas de table `users`, et un front Next.js servi sur le même
origin que l'API. Le change `add-api-foundation` ne branche aucune route de
login : il fournit uniquement les templates `JwtService` et `AuthMiddleware`.

## Décision

- JWT signé en **HS256** avec un secret partagé (`JWT_SECRET`, 32 caractères
  minimum).
- Claims : `iss` (URL de l'application), `sub` (email de l'admin), `role`,
  `iat`, `exp`.
- Durée de vie : **8 heures** (`JWT_TTL=28800`).
- Transport : cookie `auth_token` avec `HttpOnly`, `SameSite=Strict`,
  `Path=/`, et `Secure` en production.
- Aucun refresh token, aucune liste de révocation, aucune session serveur.
- Un seul administrateur, configuré par `ADMIN_EMAIL` et
  `ADMIN_PASSWORD_HASH` (variables ajoutées avec la route de login).
- Protection CSRF par `SameSite=Strict` et contrôle de `Origin`/`Referer`,
  sans token CSRF.
- Rate limiting du login prévu côté Nginx (`limit_req`), activé avec la route.

## Conséquences

Positives :

- Aucun état serveur, déploiement simple, compatible avec un monolithe.
- Cookie inaccessible au JavaScript, ce qui limite l'impact d'une XSS.
- `SameSite=Strict` bloque les requêtes cross-site, donc l'essentiel du CSRF.

Négatives et risques assumés :

- **Pas de révocation** : un token volé reste valide jusqu'à 8 h. Mitigations :
  HTTPS obligatoire, `HttpOnly`, rotation du secret, TTL court.
- **Pas de refresh** : l'admin doit se reconnecter après 8 h.
- **Un seul admin en variables d'environnement** : pas de rôles, pas d'audit,
  pas de gestion multi-utilisateurs.
- **HS256** : le secret est partagé par tous les services qui vérifient le
  token. Acceptable tant qu'un seul service émet et vérifie.
- **CSRF sans token** : si un navigateur n'applique pas `SameSite`, ou si
  l'API est exposée sur un autre origin, un token CSRF devra être ajouté.
- **TLS reporté** : la production ne doit pas être exposée sans HTTPS.

## Alternatives écartées

- **Sessions serveur** : plus simples à révoquer, mais nécessitent un stockage
  partagé et un change supplémentaire ; le JWT a été retenu pour le MVP.
- **EdDSA** : gestion de clés supplémentaire, sans bénéfice pour un monolithe.
- **Refresh token** : rotation, stockage et révocation à concevoir ; hors
  périmètre MVP.
- **Token CSRF** : complexité supplémentaire alors que `SameSite=Strict` et le
  contrôle d'`Origin` couvrent le cas same-origin.

## Évolution prévue

- Ajouter la table `users` et la route de login dans un change dédié.
- Introduire une liste de révocation ou des refresh tokens si le besoin
  d'invalidation immédiate apparaît.
- Ajouter un token CSRF si l'API doit être consommée depuis un autre origin.
- Passer à EdDSA si plusieurs services doivent vérifier les tokens.

## Retour arrière

Supprimer les templates `api/src/Auth/` et les tests associés. Aucune donnée,
aucune table et aucun volume ne sont concernés par cette décision.
