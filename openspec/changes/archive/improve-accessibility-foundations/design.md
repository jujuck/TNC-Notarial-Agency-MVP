# Design

## Context

Voir `proposal.md` — Why. Le socle actuel est un Next.js 16 Pages Router
(`web/`) avec CSS Modules, un layout public `.site`, une administration React
Admin/MUI chargée en client-only, et une API Slim sans interface. Les styles
globaux publics sont volontairement scopés sous `.site` pour ne pas affecter
MUI (`openspec/specs/web-platform/spec.md`, « Scoped global styling »).

Les contraintes qui orientent ce design :

- la cible est WCAG 2.1 AA, avec les compléments WCAG 2.2 listés dans
  `docs/accessibilite.md` ;
- le Pages Router n'embarque pas d'annonceur de route, contrairement à l'App
  Router ;
- l'administration utilise MUI/React Admin : les correctifs doivent passer par
  le thème ou un CSS admin dédié, pas par le reset public ;
- aucune modification d'API, de base de données ou de Docker n'est nécessaire ;
- les commandes de qualité s'exécutent dans les conteneurs (`make web-*`).

## Goals / Non-Goals

**Goals:**

- Corriger les fondations d'accessibilité identifiées dans
  `docs/accessibilite.md` §13, sans refonte visuelle.
- Rendre le focus, les changements de route, les formulaires et les états
  compréhensibles au clavier et au lecteur d'écran.
- Garder l'isolation CSS public/admin et la compatibilité MUI.
- Ajouter des tests de non-régression accessibles et une vérification
  automatisée proportionnée.

**Non-Goals:**

- Auditer ou modifier l'API Slim.
- Implémenter les formulaires publics, les annonces ou le simulateur : leurs
  règles sont documentées, mais leur développement reste dans des changes
  dédiés.
- Obtenir une conformité RGAA complète ou une certification.
- Ajouter un thème sombre, un mode contraste élevé dédié ou un sélecteur de
  langue.
- Remplacer React Admin ou MUI.

## Decisions

### 1. Contrastes : un jeton de bordure fort, sans changer le décoratif

`--color-border` (`#d9d2c3`) reste à 1,38:1 et demeure réservé aux bordures
décoratives (séparateurs, cartes). Ajouter `--color-border-strong: #767b85`
(3,90:1 sur papier) pour les contours de champs et les éléments graphiques
porteurs d'information. Les couleurs d'état (`danger`, `success`) ne sont pas
ajoutées tant qu'aucun composant public ne les utilise : MUI fournit déjà des
styles d'alerte contrastés pour l'admin, et les futurs formulaires définiront
leurs jetons avec leurs composants.

**Alternatives écartées :**

- assombrir `--color-border` globalement : alourdit tout le décor et ne
  distingue pas le décoratif de l'informatif ;
- utiliser `--color-accent` comme bordure de champ : 5,42:1 mais confond la
  marque et l'état de contrôle ;
- conserver `--color-border` pour les champs : échoue à 3:1.

### 2. Focus admin : thème MUI, pas de sélecteur global nu

Le focus public reste `.site :focus-visible` (contour 3 px `#b45309`, offset
3 px). Pour l'admin, créer `web/admin/theme.ts` avec `createTheme` et
`MuiCssBaseline.styleOverrides` :

- `:focus-visible` : même contour, offset 3 px ;
- `@media (prefers-reduced-motion: reduce)` : transitions et animations
  réduites.

Passer ce thème à `<Admin theme={...}>`. Les dialogues et portails MUI héritent
du `CssBaseline` du thème, ce qu'un wrapper local ne garantirait pas.

**Alternatives écartées :**

- ajouter `:focus-visible` au CSS global hors `.site` : viole l'isolation
  public/admin et peut modifier MUI ;
- styler chaque composant MUI séparément : duplication et oublis ;
- laisser le focus MUI par défaut : le contraste et l'épaisseur ne sont pas
  alignés sur la charte.

### 3. Changement de route : focus sur le `h1`

Dans `_app.tsx`, écouter `routeChangeComplete`, puis, après le rendu
(`requestAnimationFrame`), donner `tabIndex={-1}` au `h1` de `main` et le
focaliser. Ignorer le premier rendu et les changements de hash seuls. Le
contour de focus du titre est neutralisé uniquement pour ce cas non interactif
(`main h1:focus { outline: none; }`), les contrôles conservent le leur.

**Alternatives écartées :**

- région `aria-live` seule : le focus reste sur le lien activé, ce qui oblige
  l'utilisateur clavier à repartir du début ;
- focus + annonce live : double lecture chez certains lecteurs d'écran ;
- laisser le comportement natif : le lecteur d'écran ne signale pas la nouvelle
  page en Pages Router.

### 4. Lien d'évitement : cible focusable

Ajouter `tabIndex={-1}` au `<main id="contenu">` de l'accueil. Le lien
« Aller au contenu » reste le premier élément focusable. Les futures pages
réutilisent le même contrat : `main` avec `id="contenu"` et `tabIndex={-1}`.
Un second lien « Aller à la navigation » n'est ajouté que lorsque l'en-tête
gagne une recherche ou un menu utilisateur.

**Alternatives écartées :**

- compter sur le défilement seul : le focus ne suit pas dans tous les
  navigateurs ;
- déplacer le focus sur un `div` : moins sémantique qu'un `main`.

### 5. Navigation et liens : `aria-current` et soulignement par défaut

- Le lien de marque reçoit `aria-current="page"` quand `router.pathname === '/'`.
  La logique est prête pour les futures routes de navigation ; les ancres de
  section n'ont pas d'état courant tant qu'aucun scroll spy n'existe.
- `.site a` est souligné par défaut (`text-decoration: underline`,
  `text-underline-offset: 0.2em`). Les composants qui ne doivent pas l'être
  (marque, liens de navigation, boutons d'action) conservent leur
  `text-decoration: none` explicite.

**Alternatives écartées :**

- souligner uniquement certains liens au cas par cas : risque d'oubli ;
- distinguer les liens par la couleur seule : échoue à WCAG 1.4.1 ;
- ajouter `aria-current` à toutes les ancres : faux tant que la section active
  n'est pas calculée.

### 6. En-tête sticky : décalage des cibles

Ajouter `scroll-margin-top` (environ 6 rem) aux cibles d'ancre sous `.site`
(`.site [id]`) et aux contrôles qui peuvent recevoir le focus près du haut de
page. Cela évite que l'en-tête masque le focus ou le titre ciblé (WCAG 2.4.11).

**Alternatives écartées :**

- rendre l'en-tête non sticky : change le design validé ;
- `scroll-padding-top` sur `html` : efficace mais global, donc contraire à
  l'isolation CSS ; à réévaluer si `scroll-margin-top` ne suffit pas.

### 7. Formulaire de connexion admin : erreurs par champ + résumé

Remplacer l'état d'erreur unique par :

```ts
type LoginErrors = { email?: string; password?: string };
```

À la soumission :

- construire les erreurs par champ ;
- afficher un résumé `Alert severity="error"` avec `role="alert"` et une ref,
  puis focaliser ce résumé (`tabIndex={-1}`) ;
- passer `error` et `helperText` aux `TextField` MUI, qui gèrent
  `aria-invalid` et `aria-describedby` ;
- garder le bouton actif quand les champs sont vides ; le désactiver seulement
  pendant l'envoi, avec `aria-busy` ;
- utiliser `type="email"` (et retirer `inputMode="email"`), conserver
  `autoComplete="username"` et `current-password`.

**Alternatives écartées :**

- validation native du navigateur : messages non homogènes et pas de résumé
  focalisé ;
- `helperText` seul : l'erreur est associée mais le focus reste en bas du
  formulaire ;
- désactiver le bouton tant que les champs sont vides : l'utilisateur ne sait
  pas pourquoi l'action est indisponible.

### 8. Mouvement réduit côté admin

Ajouter la règle `prefers-reduced-motion` dans le thème MUI (voir décision 2).
Le CSS public conserve sa règle existante sous `.site`. Ne pas utiliser
`!important` global hors du bloc média.

**Alternatives écartées :**

- se fier aux valeurs par défaut de MUI : toutes les transitions ne sont pas
  couvertes ;
- désactiver toutes les transitions en permanence : dégrade les retours
  visuels pour les autres utilisateurs.

### 9. Tests : Testing Library d'abord, audit DOM ensuite

- Ajouter des tests Vitest/Testing Library sur `LoginPage`, `PublicLayout` et
  le helper de focus de route : rôles, labels, `aria-invalid`, focus du résumé,
  ordre du lien d'évitement.
- Ajouter `axe-core` en dépendance de développement et l'exécuter sur le DOM
  rendu (jsdom) pour les violations structurelles détectables. Avant l'ajout :
  `npm audit`, vérification de l'éditeur (Deque) et des CVE ; si l'ajout est
  refusé, conserver les tests Testing Library et documenter la limite.
- `axe` en jsdom ne calcule pas le contraste ni la mise en page : les
  vérifications manuelles de contraste, zoom et lecteur d'écran restent
  obligatoires.
- Ne pas ajouter Playwright dans ce change : le projet n'en a pas et le coût
  d'infrastructure est disproportionné pour ces correctifs. Les parcours E2E
  restent dans un change dédié.

**Alternatives écartées :**

- Playwright + `@axe-core/playwright` : meilleure couverture, mais nouvelle
  infrastructure de test et navigateurs dans les conteneurs ;
- Lighthouse CI seul : ne teste pas les interactions clavier ni les formulaires ;
- aucune automatisation : régressions silencieuses.

### 10. Ordre des modifications

1. Jetons et styles globaux (bordure, soulignement, `scroll-margin-top`).
2. Layout public et accueil (lien d'évitement focusable, `aria-current`).
3. `_app.tsx` (focus de route).
4. Thème admin + formulaire de connexion.
5. Tests, documentation et vérifications.

Aucune migration de base, aucun changement d'API, aucun changement Docker.

## Risks / Trade-offs

- **Double annonce ou perte de focus au changement de route** → tester NVDA +
  Firefox et VoiceOver + Safari ; ne déplacer que le focus, sans région live.
- **Le focus programmatique sur le `h1` affiche un contour** → neutraliser le
  contour uniquement pour `main h1:focus`, jamais pour les contrôles.
- **Les overrides MUI n'atteignent pas les portails** → vérifier un `Dialog`
  React Admin après intégration du thème.
- **Le soulignement global modifie des liens déjà stylés** → inventorier les
  liens publics et conserver les `text-decoration: none` explicites sur les
  composants concernés.
- **`scroll-margin-top` ne couvre pas tous les cas de focus** → tester le lien
  d'évitement, les ancres et les futurs champs ; compléter avec
  `scroll-padding-top` si nécessaire.
- **`axe-core` en jsdom rate le contraste et la mise en page** → conserver la
  checklist manuelle de `docs/accessibilite.md`.
- **Ajout de dépendance refusé après audit CVE** → fallback Testing Library,
  avec limite documentée.
- **Le formulaire admin est une démo** → ne pas sur-investir dans un système
  d'erreurs complexe ; le pattern doit rester réutilisable pour les formulaires
  publics.

## Migration Plan

1. Déployer le front reconstruit (`make web-build`) ; aucun ordre de migration
   de données.
2. Vérifier `make web-lint`, `make web-typecheck`, `make web-test` et
   `make web-build`.
3. Vérifier manuellement : Tab depuis le début de page, lien d'évitement,
   navigation entre pages, connexion admin invalide, zoom 200/400 %, mouvement
   réduit.
4. Retour arrière : annuler les commits du change et reconstruire l'image web.
   Aucune donnée MySQL, aucun volume et aucun conteneur à modifier.

## Open Questions

Aucune question bloquante. Le choix exact du paquet d'audit DOM (`axe-core` ou
un équivalent maintenu) peut être ajusté après `npm audit` sans changer les
specs ni l'ordre des tâches.
