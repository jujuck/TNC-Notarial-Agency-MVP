# Spec Delta

## Purpose

Décrire la page d'accueil publique de référence : rendu serveur avec revalidation, layout public, accessibilité de base et contenu statique fictif.

## ADDED Requirements

### Requirement: Public home page

Le site SHALL exposer une page d'accueil publique en français sur `GET /`, avec un seul `h1`, un en-tête, un contenu principal et un pied de page.

#### Scenario: Accueil accessible

- **WHEN** un client envoie `GET /`
- **THEN** la réponse est `200` et le HTML contient un `h1` unique, un élément `header`, un élément `main` et un élément `footer`

#### Scenario: Contenu de démonstration

- **WHEN** le contenu de l'accueil est affiché
- **THEN** les noms, coordonnées et références sont fictifs et aucune donnée personnelle réelle n'est présente

### Requirement: Incremental Static Regeneration

L'accueil SHALL être généré statiquement avec `getStaticProps` et une période de revalidation, sans dépendre de l'API au build.

#### Scenario: Build sans API

- **WHEN** le build est exécuté alors que l'API est arrêtée
- **THEN** le build réussit et l'accueil est généré

#### Scenario: Revalidation configurée

- **WHEN** la page d'accueil est demandée après la période de revalidation
- **THEN** Next.js peut régénérer la page en arrière-plan

### Requirement: Public layout

Le layout public SHALL envelopper l'accueil dans un conteneur `.site` et SHALL fournir la navigation, le pied de page et un lien d'évitement.

#### Scenario: Layout appliqué

- **WHEN** l'accueil est rendu
- **THEN** le contenu est enveloppé dans `.site` et un lien « Aller au contenu » pointe vers le contenu principal

#### Scenario: Layout non appliqué à l'admin

- **WHEN** une page `/admin` est rendue
- **THEN** elle n'est pas enveloppée dans `.site`

### Requirement: Navigation without broken links

Les liens de navigation de l'accueil SHALL pointer vers des ancres de la page ou des routes existantes.

#### Scenario: Navigation interne

- **WHEN** un utilisateur active un lien de navigation de l'accueil
- **THEN** il atteint une ancre existante ou une route qui répond sans `404`

### Requirement: Basic accessibility

L'accueil SHALL déclarer `lang="fr"`, SHALL fournir des styles de focus visibles, des textes alternatifs pour les images et un contraste conforme aux attentes WCAG 2.1 AA.

#### Scenario: Langue du document

- **WHEN** le HTML de l'accueil est analysé
- **THEN** l'élément `html` porte `lang="fr"`

#### Scenario: Focus clavier

- **WHEN** un utilisateur navigue au clavier
- **THEN** chaque élément interactif affiche un indicateur de focus visible

#### Scenario: Images décoratives ou informatives

- **WHEN** une image est présente dans l'accueil
- **THEN** elle possède un texte alternatif pertinent ou est marquée comme décorative

### Requirement: Home SEO integration

L'accueil SHALL utiliser le composant `Seo` avec un titre, une description, un canonical, Open Graph, Twitter et les données structurées `Organization` et `WebSite`.

#### Scenario: Métadonnées présentes

- **WHEN** le HTML de l'accueil est analysé
- **THEN** il contient un `title`, une meta description, un canonical, les balises Open Graph, la Twitter card et un JSON-LD `Organization` et `WebSite`

#### Scenario: Titre et description uniques

- **WHEN** l'accueil est comparé aux futures pages publiques
- **THEN** son titre et sa description sont spécifiques à l'accueil

### Requirement: No API dependency on home

L'accueil SHALL ne pas appeler l'API au build ni au runtime pour afficher son contenu.

#### Scenario: API indisponible

- **WHEN** l'API est arrêtée et que l'accueil est demandé
- **THEN** l'accueil répond `200` avec son contenu statique
