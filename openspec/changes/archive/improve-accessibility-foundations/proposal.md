# Proposal

## Why

Le socle public respecte déjà les bases (`lang="fr"`, focus visible, lien
d'évitement, contrastes des textes), mais plusieurs comportements nécessaires à
une navigation fiable au clavier et au lecteur d'écran ne sont pas couverts :
changement de route non annoncé, focus de l'administration non aligné sur le
public, erreurs de connexion non associées aux champs, liens de corps non
différenciés, cible du lien d'évitement non focusable et en-tête sticky qui peut
masquer le focus. Le référentiel `docs/accessibilite.md` formalise la cible ; ce
change implémente les fondations prioritaires avant l'ajout des formulaires
publics et des annonces.

## What Changes

- Ajouter un jeton `--color-border-strong` (≥ 3:1) pour les contours de
  contrôles et les éléments graphiques utiles ; conserver `--color-border`
  pour le décoratif uniquement.
- Étendre le style de focus visible à l'administration MUI et vérifier le focus
  dans le thème React Admin.
- Gérer le changement de route en Pages Router : focus sur le `h1` de la
  nouvelle page ou annonce dans une région `aria-live`, sans double lecture.
- Rendre `main#contenu` focusable (`tabIndex={-1}`) pour que le lien
  d'évitement déplace réellement le focus.
- Ajouter `aria-current="page"` à la navigation, souligner les liens de corps
  de texte et ajouter un décalage de scroll sous l'en-tête sticky.
- Rendre le formulaire de connexion admin accessible : `type="email"`,
  `autoComplete`, `aria-invalid`, `aria-describedby`, résumé d'erreurs et
  focus sur le résumé à la soumission.
- Étendre `prefers-reduced-motion` à l'administration et aux transitions MUI.
- Ajouter des tests d'accessibilité ciblés (Vitest/Testing Library) et une
  vérification automatisée `axe` sur les pages publiques et `/admin/login`,
  après revue des dépendances et des CVE.
- Documenter les écarts restants et les règles de revue dans
  `docs/accessibilite.md`.

## Capabilities

### New Capabilities

- `accessibility`: comportements transverses d'accessibilité du site public et
  de l'administration de démonstration — contrastes et information non portée
  par la couleur, clavier et focus, changements de route, liens d'évitement et
  landmarks, formulaires, images, zoom/reflow/mouvement, vérifications
  automatisées.

### Modified Capabilities

Aucune. Les specs existantes `public-site`, `admin-console`, `seo` et
`web-platform` restent valides ; la nouvelle capability couvre les
comportements transverses sans modifier leurs exigences.

## Impact

- Frontend Next.js : `web/styles/globals.css`, `web/pages/_app.tsx`,
  `web/pages/index.tsx`, `web/components/layout/PublicLayout.tsx`,
  `web/components/layout/PublicLayout.module.css`, `web/admin/LoginPage.tsx`,
  thème/CSS de l'administration, tests et configuration de test.
- Documentation : `docs/accessibilite.md` (référentiel et écarts).
- API Slim : aucune modification.
- Base MySQL : aucune modification, aucune migration.
- Docker / Nginx : aucune modification.
- Dépendances : ajout éventuel d'outils de test d'accessibilité, sous réserve
  de vérification de l'éditeur et des CVE.
- Retour arrière : annuler les fichiers frontend et de test listés ; aucune
  donnée, aucun schéma et aucun conteneur à modifier.
