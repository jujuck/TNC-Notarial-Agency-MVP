# Spec Delta

## Purpose

Garantir un SEO complet et démontrable sur toutes les pages, tout en imposant un noindex permanent sans variable ni interrupteur.

## ADDED Requirements

### Requirement: Complete per-page metadata

Chaque page publique SHALL utiliser le composant `Seo` et SHALL émettre un title, une meta description, un canonical, les balises Open Graph, une Twitter card `summary_large_image` et un JSON-LD.

#### Scenario: Métadonnées complètes

- **WHEN** le HTML d'une page publique est analysé
- **THEN** il contient `title`, `meta[name="description"]`, `link[rel="canonical"]`, les balises `og:*`, `twitter:card` et un script `application/ld+json`

#### Scenario: Pas de doublon

- **WHEN** le HTML d'une page publique est analysé
- **THEN** chaque balise SEO attendue apparaît une seule fois

### Requirement: Constant noindex meta

Le composant `Seo` SHALL toujours émettre `<meta name="robots" content="noindex, nofollow">`, sans prop ni condition de désactivation.

#### Scenario: Noindex sur l'accueil

- **WHEN** le HTML de l'accueil est analysé
- **THEN** il contient exactement `<meta name="robots" content="noindex, nofollow">`

#### Scenario: Aucune valeur index

- **WHEN** les métadonnées robots de toutes les pages sont inspectées
- **THEN** aucune ne contient la valeur `index` ou `follow` seule

### Requirement: No indexing switch

Le système SHALL ne pas exposer de variable, prop ou option permettant de réactiver l'indexation, notamment `INDEXABLE`, `NEXT_PUBLIC_SEO_INDEXABLE` ou `SITE_INDEXABLE`.

#### Scenario: Aucun interrupteur dans le code

- **WHEN** le code et la configuration sont recherchés
- **THEN** aucune variable ou prop d'indexation n'existe

#### Scenario: Noindex indépendant de l'environnement

- **WHEN** le site est construit ou démarré sans variable SEO
- **THEN** le noindex reste présent

### Requirement: HTTP noindex header

Toute réponse servie par Next.js, y compris les pages, `_next/static`, les images, `/sitemap.xml` et `/robots.txt`, SHALL porter `X-Robots-Tag: noindex, nofollow`.

#### Scenario: En-tête sur une page

- **WHEN** un client envoie `HEAD /`
- **THEN** la réponse contient `X-Robots-Tag: noindex, nofollow`

#### Scenario: En-tête sur un asset statique

- **WHEN** un client demande un fichier sous `/_next/static/`
- **THEN** la réponse contient `X-Robots-Tag: noindex, nofollow`

#### Scenario: En-tête sur le sitemap et robots.txt

- **WHEN** un client demande `/sitemap.xml` ou `/robots.txt`
- **THEN** la réponse contient `X-Robots-Tag: noindex, nofollow`

### Requirement: Static robots.txt

`/robots.txt` SHALL être un fichier statique contenant `User-agent: *` et `Allow: /`. Il MUST NOT contenir `Disallow: /` ni de ligne `Sitemap:`.

#### Scenario: Contenu autorisé

- **WHEN** `/robots.txt` est demandé
- **THEN** la réponse contient `User-agent: *` et `Allow: /`

#### Scenario: Pas de blocage total

- **WHEN** `/robots.txt` est analysé
- **THEN** il ne contient ni `Disallow: /` ni ligne `Sitemap:`

### Requirement: Sitemap generation

Le postbuild SHALL générer `/sitemap.xml` avec `next-sitemap` à partir de `NEXT_PUBLIC_SITE_URL`, en désactivant la génération de `robots.txt` et en excluant `/admin`.

#### Scenario: Sitemap accessible

- **WHEN** un client demande `/sitemap.xml`
- **THEN** la réponse est `200` et contient l'URL absolue de l'accueil

#### Scenario: Admin exclu

- **WHEN** le sitemap est analysé
- **THEN** il ne contient aucune URL sous `/admin`

#### Scenario: robots.txt non écrasé

- **WHEN** le postbuild est exécuté
- **THEN** le `robots.txt` statique conserve son contenu d'origine

### Requirement: Sitemap not advertised

Le `robots.txt` SHALL ne pas référencer le sitemap et le sitemap SHALL ne pas être soumis à Search Console ou Bing Webmaster Tools.

#### Scenario: Aucune ligne Sitemap

- **WHEN** `/robots.txt` est analysé
- **THEN** il ne contient pas de ligne `Sitemap:`

### Requirement: Canonical URL

Le canonical SHALL être absolu, construit avec `NEXT_PUBLIC_SITE_URL` et le chemin de la page, sans double slash ni slash final superflu.

#### Scenario: Canonical de l'accueil

- **WHEN** `NEXT_PUBLIC_SITE_URL=https://exemple.test` et la page est `/`
- **THEN** le canonical vaut `https://exemple.test/`

#### Scenario: Chemin normalisé

- **WHEN** le chemin fourni contient un slash final
- **THEN** le canonical ne contient pas de double slash

### Requirement: JSON-LD

Chaque page SHALL pouvoir fournir un JSON-LD valide via `Seo`. L'accueil SHALL fournir les types `Organization` et `WebSite`.

#### Scenario: JSON-LD valide

- **WHEN** le script JSON-LD de l'accueil est parsé
- **THEN** il contient les types `Organization` et `WebSite`

#### Scenario: Type de script correct

- **WHEN** le HTML est analysé
- **THEN** le JSON-LD est contenu dans un script `type="application/ld+json"`

### Requirement: Admin noindex

Les pages `/admin` SHALL également émettre la meta noindex et SHALL recevoir `X-Robots-Tag: noindex, nofollow`.

#### Scenario: Noindex admin

- **WHEN** `/admin` est demandé
- **THEN** la réponse porte `X-Robots-Tag: noindex, nofollow` et le HTML contient la meta robots noindex
