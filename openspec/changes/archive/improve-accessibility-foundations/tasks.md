# Tasks

Ce change ne nécessite aucune migration de base, aucun changement d'API et
aucun changement Docker. Les commandes de vérification s'exécutent dans les
conteneurs via `make web-*`.

## 1. Jetons et styles globaux

- [ ] 1.1 Ajouter `--color-border-strong: #767b85` dans `web/styles/globals.css` et l'utiliser pour les futurs contours de contrôles ; vérifier le ratio 3,90:1 sur papier avec un contrôle de contraste, puis `make web-lint` — commit `style(web): ajouter un jeton de bordure accessible`
- [ ] 1.2 Souligner par défaut les liens de contenu (`.site a`) avec `text-underline-offset`, en conservant `text-decoration: none` sur la marque, la navigation et les boutons d'action ; vérifier visuellement l'accueil et `make web-lint` — commit `style(web): souligner les liens de contenu`
- [ ] 1.3 Ajouter `scroll-margin-top` aux cibles d'ancre sous `.site` et vérifier qu'un lien d'ancre et le lien d'évitement ne sont pas masqués par l'en-tête sticky — commit `style(web): décaler les cibles sous l'en-tête sticky`
- [ ] 1.4 Mettre à jour le tableau d'audit de `docs/accessibilite.md` avec `--color-border-strong` et vérifier que les ratios documentés correspondent aux jetons — commit `docs(accessibilite): documenter le jeton de bordure fort`

## 2. Layout public et accueil

- [ ] 2.1 Ajouter `tabIndex={-1}` au `<main id="contenu">` de l'accueil et vérifier au clavier que « Aller au contenu » déplace le focus dans le contenu — commit `fix(web): rendre la cible du lien d'évitement focusable`
- [ ] 2.2 Ajouter `aria-current="page"` au lien de marque sur `/` et préparer la comparaison `router.pathname` pour les futures routes de navigation ; vérifier avec `make web-test` — commit `feat(web): exposer la page courante dans la navigation`
- [ ] 2.3 Ajouter les tests Testing Library de `PublicLayout` : lien d'évitement en premier, cible `main`, `aria-current` et libellé de navigation ; vérifier `make web-test` — commit `test(web): couvrir le lien d'évitement et la navigation`
- [ ] 2.4 Mettre à jour `docs/accessibilite.md` §4 et §13 pour le lien d'évitement focusable et `aria-current` — commit `docs(accessibilite): documenter le lien d'évitement focusable`

## 3. Changement de route

- [ ] 3.1 Créer un helper de focus sur le `h1` de `main` et l'appeler depuis `routeChangeComplete` dans `web/pages/_app.tsx`, en ignorant le premier rendu et les changements de hash ; vérifier au clavier entre deux pages et avec un lecteur d'écran — commit `feat(web): focaliser le titre au changement de route`
- [ ] 3.2 Ajouter un test unitaire du helper de focus (titre introuvable, `tabIndex=-1`, focus appelé) et vérifier `make web-test` — commit `test(web): couvrir le focus au changement de route`
- [ ] 3.3 Mettre à jour `docs/accessibilite.md` §3 et §13 pour le comportement retenu (focus du titre, pas de double annonce) — commit `docs(accessibilite): documenter le focus de route`

## 4. Administration

- [ ] 4.1 Créer `web/admin/theme.ts` avec un thème MUI qui applique `:focus-visible` et `prefers-reduced-motion`, puis passer le thème à `<Admin>` ; vérifier le focus sur les boutons/champs admin et le mouvement réduit — commit `feat(admin): aligner le focus et le mouvement réduit`
- [ ] 4.2 Refondre `web/admin/LoginPage.tsx` : `type="email"`, erreurs par champ, `aria-invalid`/`aria-describedby` via MUI, résumé d'erreurs focalisé, `aria-busy` pendant l'envoi et bouton actif quand le formulaire est incomplet ; vérifier au clavier et avec `make web-test` — commit `fix(admin): rendre le formulaire de connexion accessible`
- [ ] 4.3 Ajouter les tests de `LoginPage` : labels, `type="email"`, résumé focalisé, `aria-invalid`, bouton actif et message d'erreur compréhensible ; vérifier `make web-test` — commit `test(admin): couvrir le formulaire de connexion accessible`
- [ ] 4.4 Mettre à jour `docs/accessibilite.md` §5, §9 et §13 pour le thème admin et le formulaire de connexion — commit `docs(accessibilite): documenter l'accessibilité de l'admin`

## 5. Audit automatisé

- [ ] 5.1 Évaluer et ajouter `axe-core` en dépendance de développement après `npm audit`, vérification de l'éditeur et des CVE ; si l'ajout est refusé, consigner la décision et conserver les tests Testing Library — commit `chore(web): ajouter l'audit d'accessibilité automatisé`
- [ ] 5.2 Ajouter les audits DOM sur le layout public et `/admin/login` (rôles, libellés, landmarks) et vérifier `make web-test` — commit `test(web): auditer les écrans avec axe`
- [ ] 5.3 Mettre à jour `docs/accessibilite.md` §11 avec la commande, la couverture et les limites de l'audit jsdom — commit `docs(accessibilite): documenter les contrôles automatisés`

## 6. Vérification d'intégration

- [ ] 6.1 Exécuter `make web-lint`, `make web-typecheck`, `make web-test` et `make web-build` ; vérifier que chaque commande se termine avec le code 0
- [ ] 6.2 Vérifier manuellement au clavier : lien d'évitement, navigation entre pages, focus admin, connexion invalide, zoom 200 % et 400 %, `prefers-reduced-motion` ; consigner les résultats dans la PR
- [ ] 6.3 Vérifier que `docs/accessibilite.md` §13 ne liste plus comme ouverts les écarts corrigés et que les écarts restants sont justifiés

## Workflow follow-up

- Archiver le change après revue et vérifications.
- Ne pas pousser sur la branche principale ni merger la PR.
