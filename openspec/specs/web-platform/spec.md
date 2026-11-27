# web-platform Specification

## Purpose

Fournir le socle Next.js Pages Router de la démo, son runtime Docker standalone et son intégration au reverse proxy, sans logique métier.

## Requirements

### Requirement: Next.js Pages Router runtime

L'application web SHALL servir les pages publiques avec le Pages Router de Next.js. Toute route inconnue SHALL renvoyer la page 404 de Next.js.

#### Scenario: Page d'accueil servie par Next

- **WHEN** un client envoie `GET /`
- **THEN** le serveur répond `200` avec une page HTML générée par Next.js

#### Scenario: Route inconnue

- **WHEN** un client envoie `GET /route-inconnue`
- **THEN** le serveur répond `404` avec la page 404 de Next.js

### Requirement: Standalone production build

Le build de production SHALL produire une sortie `standalone`, activer le mode strict React et désactiver l'en-tête `X-Powered-By`.

#### Scenario: Sortie standalone

- **WHEN** `npm run build` est exécuté
- **THEN** le répertoire `.next/standalone` contient un `server.js` démarrable avec `node server.js`

#### Scenario: En-tête powered-by absent

- **WHEN** une réponse HTTP est servie par Next.js
- **THEN** elle ne contient pas d'en-tête `X-Powered-By`

### Requirement: Build-time site URL

Le build SHALL exiger `NEXT_PUBLIC_SITE_URL` et l'utiliser pour construire les URL absolues (canonical, Open Graph, sitemap).

#### Scenario: URL absolue configurée

- **WHEN** le build est lancé avec `NEXT_PUBLIC_SITE_URL=https://exemple.test`
- **THEN** le canonical de l'accueil commence par `https://exemple.test`

#### Scenario: Variable absente

- **WHEN** le build est lancé sans `NEXT_PUBLIC_SITE_URL`
- **THEN** le build échoue avec un message nommant la variable manquante

### Requirement: Server-side API base

Les appels API côté serveur SHALL utiliser la base `${API_INTERNAL_URL}/api/v1` et SHALL ne jamais exposer `API_INTERNAL_URL` au navigateur.

#### Scenario: Appel serveur

- **WHEN** une fonction serveur appelle l'API
- **THEN** l'URL construite commence par la valeur de `API_INTERNAL_URL` suivie de `/api/v1`

#### Scenario: Variable non exposée

- **WHEN** les bundles navigateur sont inspectés
- **THEN** ils ne contiennent pas la valeur de `API_INTERNAL_URL`

### Requirement: Browser API base

Les appels API côté navigateur SHALL utiliser le chemin relatif `/api/v1/...` avec `credentials: 'include'` et SHALL ne pas ajouter d'en-tête `Authorization`.

#### Scenario: Appel navigateur

- **WHEN** le navigateur appelle une route API
- **THEN** la requête cible `/api/v1/...` avec `credentials: 'include'` et sans en-tête `Authorization`

#### Scenario: Aucun token lisible

- **WHEN** le code navigateur est inspecté
- **THEN** aucun token n'est lu ou écrit dans `localStorage` ou `sessionStorage`

### Requirement: Scoped global styling

Les composants SHALL utiliser des CSS Modules. Un seul fichier CSS global SHALL être importé dans `_app`, limité aux variables CSS et à un reset scopé sous `.site`, sans sélecteur d'élément nu.

#### Scenario: Admin non affecté

- **WHEN** la page `/admin` est rendue
- **THEN** elle n'est pas enveloppée dans `.site` et le reset global ne s'y applique pas

#### Scenario: Pas de sélecteur nu

- **WHEN** le fichier CSS global est analysé
- **THEN** il ne contient pas de sélecteur nu `button`, `input`, `h1` ou équivalent

### Requirement: Standalone container

L'image web SHALL être multi-stage, SHALL démarrer depuis la sortie `standalone` et SHALL s'exécuter avec un utilisateur non-root.

#### Scenario: Démarrage du conteneur

- **WHEN** l'image est construite puis démarrée
- **THEN** le processus principal est `node server.js` et le service répond sur le port `3000`

#### Scenario: Utilisateur non-root

- **WHEN** l'image est inspectée
- **THEN** l'utilisateur d'exécution n'est pas `root`

### Requirement: Reverse proxy routing

Le reverse proxy SHALL router `/api` vers l'API et `/` vers le service web. Il SHALL conserver `X-Robots-Tag` uniquement sur `/api` et SHALL ne pas ajouter de logique SEO aux réponses Next.

#### Scenario: Route API préservée

- **WHEN** un client envoie `GET /api/v1/health`
- **THEN** la réponse provient de l'API avec le statut `200` et ses en-têtes de sécurité

#### Scenario: Route publique proxyfiée

- **WHEN** un client envoie `GET /`
- **THEN** la réponse provient du service Next.js

### Requirement: Development HMR through proxy

En développement, le reverse proxy SHALL transmettre les en-têtes `Upgrade` et `Connection` nécessaires au HMR de Next.js.

#### Scenario: WebSocket de développement

- **WHEN** le navigateur ouvre le WebSocket HMR à travers le proxy
- **THEN** la connexion est transmise au service web

### Requirement: No Next API routes under /api

Le projet SHALL ne pas créer de routes `pages/api` sous le préfixe `/api`, qui appartient à l'API externe.

#### Scenario: Préfixe réservé

- **WHEN** l'arborescence `pages/api` est inspectée
- **THEN** aucun fichier ne sert une route sous `/api`

#### Scenario: API externe joignable

- **WHEN** un client envoie `GET /api/v1/health`
- **THEN** la requête est traitée par l'API Slim, pas par Next.js

### Requirement: Quality commands

Le projet SHALL fournir des commandes de lint, vérification de types, tests et build exécutables dans les conteneurs Docker.

#### Scenario: Suite de qualité

- **WHEN** `npm run lint`, `npm run typecheck`, `npm test` et `npm run build` sont exécutés
- **THEN** chaque commande se termine avec le code `0`
