# Spec Delta

## Purpose

Fournir une coquille d'administration React Admin chargée uniquement côté client, avec une authentification factice et un middleware de navigation, sans accès aux données réelles.

## ADDED Requirements

### Requirement: Client-only admin shell

Les routes `/admin` et `/admin/*` SHALL rendre une coquille React Admin chargée uniquement côté client via `ssr: false`. Le HTML initial MUST NOT contenir de contenu administrateur.

#### Scenario: HTML initial sans admin

- **WHEN** un client envoie `GET /admin`
- **THEN** le HTML initial contient seulement un espace de chargement et aucun balisage React Admin

#### Scenario: Montage côté client

- **WHEN** le JavaScript de la page admin est chargé
- **THEN** React Admin se monte dans le navigateur

#### Scenario: Route admin profonde

- **WHEN** un client envoie `GET /admin/une/route`
- **THEN** la page catch-all répond `200` et laisse React Admin gérer la route

### Requirement: Admin bundle isolation

React Admin et MUI MUST NOT être inclus dans les bundles des pages publiques.

#### Scenario: Bundle public sans admin

- **WHEN** les chunks chargés par l'accueil sont inspectés
- **THEN** ils ne contiennent ni React Admin ni MUI

#### Scenario: Accueil autonome

- **WHEN** l'accueil est chargé dans un navigateur
- **THEN** aucun chunk d'administration n'est téléchargé

### Requirement: Fake authentication

`/admin/login` SHALL afficher un formulaire de connexion. Toute paire email/mot de passe non vide SHALL authentifier localement, sans appel API.

#### Scenario: Connexion factice

- **WHEN** l'utilisateur soumet un email et un mot de passe non vides
- **THEN** il est redirigé vers `/admin` et la session de démonstration est active

#### Scenario: Champs vides

- **WHEN** l'utilisateur soumet un formulaire incomplet
- **THEN** la connexion est refusée avec un message d'erreur

#### Scenario: Aucun appel API

- **WHEN** l'utilisateur se connecte ou se déconnecte
- **THEN** aucune requête vers `/api` n'est émise

### Requirement: Demo session cookie

Le login factice SHALL poser un cookie `demo_session`, drapeau de démonstration et non token d'authentification. Le logout SHALL le supprimer et `checkAuth` SHALL exiger `demo_session` dans ce change.

#### Scenario: Session persistante

- **WHEN** l'utilisateur se connecte puis recharge la page
- **THEN** il reste authentifié grâce au cookie `demo_session`

#### Scenario: Déconnexion

- **WHEN** l'utilisateur se déconnecte
- **THEN** le cookie `demo_session` est supprimé et il est renvoyé vers `/admin/login`

#### Scenario: Cookie non sensible

- **WHEN** le cookie `demo_session` est inspecté
- **THEN** il ne contient ni JWT ni donnée d'identité

### Requirement: Middleware redirect

Le proxy Next.js (convention `proxy.ts`, ex-`middleware`) SHALL intercepter `/admin/:path*`. Sans cookie `auth_token` ni `demo_session`, il SHALL rediriger vers `/admin/login`, sauf pour `/admin/login` lui-même.

#### Scenario: Accès sans session

- **WHEN** un client demande `/admin` sans cookie de session
- **THEN** il est redirigé vers `/admin/login`

#### Scenario: Accès avec session de démonstration

- **WHEN** un client demande `/admin` avec `demo_session`
- **THEN** la requête est laissée passer et la page répond `200`

#### Scenario: Page de login accessible

- **WHEN** un client demande `/admin/login` sans cookie
- **THEN** la page de login est servie sans redirection

### Requirement: Admin no-store

Les réponses sous `/admin/:path*` SHALL porter `Cache-Control: no-store`.

#### Scenario: En-tête no-store

- **WHEN** un client envoie `HEAD /admin`
- **THEN** la réponse contient `Cache-Control: no-store`

### Requirement: No real data provider or resources

Ce change MUST NOT implémenter le vrai `authProvider`, le vrai `dataProvider`, les resources ou des appels API métier. Un `dataProvider` stub MAY être utilisé uniquement pour monter React Admin.

#### Scenario: Aucune resource

- **WHEN** la coquille admin est affichée
- **THEN** aucune resource métier n'est enregistrée

#### Scenario: Aucun appel métier

- **WHEN** l'admin est utilisé
- **THEN** aucune requête vers les routes métier de l'API n'est émise

### Requirement: CSS isolation

L'admin SHALL ne pas hériter du layout `.site` et le CSS global public MUST NOT modifier son apparence.

#### Scenario: Admin hors du layout public

- **WHEN** `/admin` est rendu
- **THEN** le conteneur `.site` est absent

#### Scenario: Reset public sans effet

- **WHEN** le CSS global public est chargé sur `/admin`
- **THEN** il ne modifie pas les composants MUI de l'admin
