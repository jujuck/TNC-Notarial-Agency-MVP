# Accessibilité

Référentiel du site public et de l'administration de démonstration de l'étude
notariale fictive. Il fixe les règles applicables, les écarts connus et la
checklist de revue de chaque écran.

## 1. Périmètre et cible

| Élément        | Valeur                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Référentiel    | WCAG 2.1 niveau AA + RGAA 4.1 (sous-ensemble ciblé)                    |
| Compléments    | WCAG 2.2 AA : 2.4.11, 2.5.8, 3.2.6, 3.3.7, 3.3.8                       |
| Statut         | Site de démonstration `noindex` : conformité non obligatoire, visée qualité et rigueur |
| Front          | Next.js 16.4, **Pages Router**, React 19, TypeScript, CSS Modules       |
| Administration | React Admin 5 + MUI 9, chargé uniquement côté client (`ssr: false`)     |
| API            | PHP Slim 4, MySQL 8.4, Nginx ; aucune interface utilisateur             |

L'API n'a pas d'interface à auditer. En revanche, ses messages d'erreur
(Problem Details) doivent rester exploitables par le front : le front affiche
un texte compréhensible, jamais un code brut ou un identifiant technique seul.

Le périmètre couvre :

- les pages publiques : accueil, pages thématiques, annonces, simulateur,
  prise de rendez-vous, contact, FAQ, glossaire, actualités, pages légales,
  404 et 500 ;
- l'administration de démonstration : connexion, tableau de bord et futurs
  écrans de gestion ;
- les éléments transverses : en-tête, navigation, pied de page, bandeau de
  démonstration et éventuel bandeau de consentement.

Ne sont pas visés : une certification RGAA complète, les navigateurs anciens,
l'accessibilité des documents PDF non produits par le projet et l'audit de
l'API.

## 2. Contrastes, couleurs et états

### 2.1 Audit de la palette actuelle

Ratios calculés sur les jetons de `web/styles/globals.css`.

| Jeton / couleur              | Usage principal              | Ratio     | Verdict |
| ---------------------------- | ---------------------------- | --------- | ------- |
| `--color-ink` `#14213d`      | Texte sur papier             | 14,68:1   | AAA     |
| `--color-ink-soft` `#2d3a57` | Texte secondaire             | 10,41:1   | AAA     |
| `--color-muted` `#5c6370`    | Texte tertiaire              | 5,56:1    | AA      |
| `--color-accent` `#8a5a1f`   | Liens, libellés              | 5,42:1    | AA      |
| `--color-accent` sur blanc   | Bouton / texte               | 5,89:1    | AA      |
| Blanc sur `--color-accent`   | Bouton plein                 | 5,89:1    | AA      |
| `#f4efe5` sur `--color-ink`  | Texte du pied de page        | 13,94:1   | AAA     |
| `#cfc7b8` sur `--color-ink`  | Texte secondaire du pied     | 9,52:1    | AAA     |
| `--color-focus` `#b45309`    | Indicateur de focus          | 4,61:1    | OK (≥ 3:1) |
| `--color-focus` sur `ink`    | Focus sur fond sombre        | 3,18:1    | OK (≥ 3:1) |
| `--color-border` `#d9d2c3`   | Bordures décoratives         | 1,38:1    | Décoratif uniquement |
| `--color-accent-soft`        | Fond d'encart                | 12,60:1 avec `ink` | OK |

Conséquences :

- `--color-border` ne doit **jamais** matérialiser seul la limite d'un champ,
  d'un bouton ou d'un état porteur d'information : 1,38:1 est insuffisant.
  Ajouter un jeton `--color-border-strong` (par exemple `#767b85`, 3,90:1 sur
  papier) pour les contours de contrôles et les éléments graphiques utiles.
- Les couleurs d'état proposées doivent être validées : `#b3261e` (erreur,
  6,01:1) et `#2e6b3a` (succès, 5,88:1) sur papier. Elles ne remplacent jamais
  un libellé ou une icône.
- Le contraste du texte reste à vérifier après tout changement de palette, y
  compris pour le texte posé sur `--color-accent-soft` et sur les images.

### 2.2 Règles

- **RGAA 3.2 / WCAG 1.4.3** : texte normal 4,5:1 minimum ; texte large
  (≥ 18 px ou ≥ 14 px gras) 3:1 minimum.
- **RGAA 3.3 / WCAG 1.4.11** : composants d'interface et éléments graphiques
  porteurs d'information 3:1 minimum (contours de champs, icônes d'état,
  indicateurs de sélection).
- **RGAA 3.1 / WCAG 1.4.1** : la couleur n'est jamais le seul moyen de
  transmettre une information. Toute erreur, tout succès, tout état
  (disponible, complet, expiré) associe **icône + texte**.
- **WCAG 2.4.11** : l'indicateur de focus doit rester visible, non masqué par
  l'en-tête sticky ou un bandeau.
- Les liens dans le corps de texte sont soulignés par défaut. Un lien de
  navigation peut être identifié par son contexte, mais doit avoir un focus
  visible et, pour la page courante, `aria-current="page"`.
- Les états désactivés ne reposent pas uniquement sur une opacité faible : le
  contrôle reste lisible et une explication textuelle est fournie si l'action
  est indisponible.
- La palette est vérifiée avec un contrôle de contraste et un simulateur de
  daltonisme avant validation graphique. Le risque principal du projet est le
  couple brun `accent` / bleu `ink`, pas les combinaisons vert/rouge d'un
  potager.

## 3. Clavier, focus et changements de route

- Tout élément interactif est atteignable au clavier, dans un ordre logique.
  Aucun `tabIndex` positif.
- **RGAA 10.7 / WCAG 2.4.7** : focus visible sur tous les contrôles.
  Le style global `.site :focus-visible` (contour 3 px, offset 3 px) est la
  référence ; ne jamais le supprimer sans remplacement au moins aussi visible.
  L'administration MUI doit recevoir un style de focus équivalent dans son
  thème, car le style public est scopé sous `.site`.
- L'en-tête public est `position: sticky` : ajouter un décalage de scroll
  (`scroll-padding-top` sur le conteneur de scroll ou `scroll-margin-top` sur
  les cibles d'ancre) pour que le focus et les liens d'ancre ne soient pas
  masqués.
- Les modales suivent le pattern dialogue :
  - focus déplacé dans la modale à l'ouverture (titre ou premier contrôle) ;
  - `Tab` / `Shift+Tab` bouclent dans la modale ;
  - `Échap` ferme et **restitue le focus** au déclencheur ;
  - `role="dialog"` + `aria-modal="true"` + `aria-labelledby` vers le titre ;
  - le reste de la page est inerte (`<dialog>` natif ou `inert`) ;
  - l'action destructive n'est pas le focus par défaut et son effet est décrit.
- Sur le site public, privilégier `<dialog>` natif avec `showModal()` : il gère
  le piège de focus, l'inertie de l'arrière-plan et `Échap`. Sur
  l'administration, utiliser le `Dialog` MUI, qui fournit le même comportement.
- **Changement de route (Pages Router)** : Next.js n'annonce pas
  automatiquement la nouvelle page. Au `routeChangeComplete`, déplacer le focus
  sur le `h1` de la nouvelle page (`tabIndex={-1}`) **ou** annoncer le titre
  dans une région `aria-live="polite"`. Ne pas cumuler les deux, sous peine de
  double lecture.
- Aucun piège au clavier ailleurs que dans une modale. Les menus, accordéons,
  onglets et carrousels restent contrôlables au clavier.
- Les raccourcis clavier, s'il y en a, sont documentés et désactivables
  (WCAG 2.1.4).

Exemple de gestion du changement de route dans `web/pages/_app.tsx` :

```tsx
const router = useRouter();

useEffect(() => {
  const onRouteChange = () => {
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus();
    });
  };

  router.events.on('routeChangeComplete', onRouteChange);
  return () => router.events.off('routeChangeComplete', onRouteChange);
}, [router.events]);
```

## 4. Lien d'évitement et landmarks

- **RGAA 12.7 / WCAG 2.4.1** : le lien « Aller au contenu » est le premier
  élément focusable du DOM, masqué visuellement hors focus.
- La cible `main#contenu` porte `tabIndex={-1}` pour que le focus suive
  réellement l'activation du lien dans tous les navigateurs.
- Un second lien d'évitement est ajouté si l'en-tête devient dense (recherche,
  menu utilisateur) : « Aller à la navigation ». Sur une liste d'annonces avec
  filtres, prévoir « Aller aux résultats ».
- Landmarks : `header`, `nav` avec `aria-label`, `main`, `footer`. Les `nav`
  multiples ont des libellés distincts ; les `aside` sont nommés.
- Un seul `h1` par page, hiérarchie de titres sans saut de niveau. Les sections
  utilisent `aria-labelledby` vers leur titre.
- `<html lang="fr">` est déjà posé dans `_document.tsx`. Tout passage dans une
  autre langue porte un attribut `lang` local.
- L'administration doit aussi exposer un `main`, un `h1` et, si React Admin ne
  le fournit pas, un lien d'évitement.

## 5. Formulaires

Concerne : contact, prise de rendez-vous, simulateur, connexion admin et tout
formulaire futur.

- **RGAA 11.1 / WCAG 1.3.1, 4.1.2** : chaque champ a un `<label htmlFor>` visible
  et associé. Le placeholder ne sert jamais de libellé.
- **RGAA 11.10 / WCAG 3.3.1, 3.3.3** : les erreurs sont identifiées par du
  texte, associées au champ (`aria-describedby`) et signalées par
  `aria-invalid`. Un résumé d'erreurs en tête de formulaire reprend les
  messages avec des liens vers les champs ; le focus est déplacé sur ce résumé
  à la soumission.
- Les champs obligatoires sont signalés par le mot « obligatoire » dans le
  libellé, pas seulement par un astérisque coloré. `required` est présent.
- `autoComplete` est renseigné avec les jetons attendus (`email`, `tel`,
  `postal-code`, `address-line1`, `organization`, `current-password`,
  `username`, etc.).
- Le `type` HTML est correct (`email`, `tel`, `number`, `date`) ; `inputMode`
  ne le remplace pas, il le complète.
- Validation au blur et à la soumission, pas à chaque frappe. Les messages
  restent stables et ne sont pas répétés en boucle par le lecteur d'écran.
- Le bouton de soumission n'est **pas** désactivé parce que le formulaire est
  incomplet. Il peut être désactivé pendant l'envoi, avec `aria-busy` et un
  message d'état (`role="status"`) ; la double soumission est empêchée.
- Le succès est annoncé dans une région `role="status"` et reste visible.
- Les groupes de radios et cases à cocher (créneaux de rendez-vous, options du
  simulateur) sont dans un `fieldset` avec un `legend`.
- Pas de CAPTCHA inaccessible : préférer un honeypot ou une protection
  équivalente ; sinon, fournir une alternative.
- Les mots de passe acceptent le collage et les gestionnaires de mots de passe.
  Pas de test cognitif imposé (WCAG 3.3.8).
- Les erreurs de l'API sont traduites en messages métier compréhensibles et
  rattachées au bon champ. Un `detail` Problem Details brut n'est pas affiché
  seul.
- Le simulateur affiche son résultat dans une région `aria-live="polite"`, en
  texte (montants formatés en `fr-FR`), avec l'avertissement « estimation
  indicative ». Si un graphique est ajouté, un tableau équivalent est fourni.
- Aucun délai de saisie imposé ; si une session expire, prévenir et permettre
  de prolonger.

Exemple de champ accessible :

```tsx
<label htmlFor="email">
  Adresse e-mail <span>(obligatoire)</span>
</label>
<input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  required
  aria-invalid={emailError ? true : undefined}
  aria-describedby={emailError ? 'email-error' : undefined}
/>
{emailError ? (
  <p id="email-error" role="alert">
    {emailError}
  </p>
) : null}
```

## 6. Sémantique et composants interactifs

- **RGAA 9.1 / WCAG 4.1.2** : tout élément cliquable est un `<button>` ou un
  `<a href>` natif. Pas de `<div onClick>`, pas de `role="button"` quand un
  bouton natif suffit.
- **RGAA 9.3 / WCAG 1.3.1** : les listes sont des `ul`/`ol`, les définitions
  des `dl`, les tableaux des `table`.
- Onglets : utiliser le pattern ARIA Tabs uniquement pour de vrais panneaux
  (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`,
  `role="tabpanel"`, flèches gauche/droite, `Home`/`End`). Sinon, de simples
  liens suffisent.
- Accordéons FAQ : privilégier `<details>` / `<summary>`. Pour un accordéon
  custom, le bouton est dans un titre, avec `aria-expanded` et `aria-controls`.
- Tableaux : `caption`, `th scope="col"` / `scope="row"`, `aria-sort` sur les
  colonnes triables. Un tableau large défile dans une région focusable
  (`tabIndex={0}`, `role="region"`, `aria-label`).
- États : `aria-pressed` pour un bouton bascule, `aria-expanded` pour un
  dépliant, `aria-selected` pour un onglet, `aria-current="page"` pour la page
  active. Une classe CSS `.active` ne suffit jamais.
- Icônes : `aria-hidden="true"` si décoratives ; le contrôle porte un nom
  accessible (`aria-label` ou texte masqué visuellement). Un `aria-label` sur
  une icône seule ne rend pas le bouton accessible.
- Notifications et messages : `role="status"` (poli) pour les confirmations,
  `role="alert"` (assertif) pour les erreurs bloquantes. Ils ne volent pas le
  focus et sont refermables.
- Infobulles : jamais la seule source d'information ; visibles au survol et au
  focus, stables, fermables avec `Échap`, sans piège au clavier (WCAG 1.4.13).
- Dates et heures : `<time datetime="…">` avec un affichage français lisible.
- Liens externes : indiquer l'ouverture dans un nouvel onglet si c'est le cas.
  Téléchargements : indiquer le type et le poids du fichier.
- Pas de carrousel automatique. S'il y en a un, prévoir pause, arrêt et
  navigation clavier.

## 7. Images, icônes et médias

- **RGAA 1.1 / WCAG 1.1.1** : toute image informative a un `alt` contextuel ;
  toute image décorative a `alt=""`.
- Les photos d'annonces décrivent le bien (« Séjour avec parquet et fenêtres
  doubles »), pas « photo 1 » ou « image ».
- Les logos sont soit nommés, soit décoratifs s'ils sont accompagnés du nom en
  texte. Le monogramme `EN` de l'en-tête est déjà `aria-hidden`, à conserver.
- SVG inline : `role="img"` + `<title>` ou `aria-label` s'il est informatif ;
  `aria-hidden="true"` + `focusable="false"` s'il est décoratif.
- Emoji : `aria-hidden="true"` s'il double un texte, sinon nom accessible.
- Pas de texte dans une image. Si c'est inévitable, l'`alt` reprend le texte.
- Image complexe (plan, schéma, capture d'acte) : `alt` court + description
  longue à proximité.
- Vidéo : sous-titres et transcription ; pas de lecture automatique avec son.
- PDF : version accessible ou équivalent HTML ; prévenir du format et du poids.

## 8. Zoom, reflow, responsive et mouvement

- **RGAA 10.4 / WCAG 1.4.4** : le texte est redimensionnable à 200 % sans perte
  de fonction. Utiliser `rem`/`em`, pas de `px` figé pour la typographie.
- **WCAG 1.4.10** : à 400 % de zoom et 320 px de large, pas de scroll
  horizontal hors tableaux de données. Les grilles `auto-fit`/`minmax` et les
  largeurs `min(100% - 2rem, …)` vont dans le bon sens ; tester l'en-tête
  sticky et les cartes d'annonces à fort zoom.
- **WCAG 2.5.8** : cible tactile minimale de 24 × 24 px ; viser 44 × 44 px pour
  les actions principales sur mobile.
- Ne pas verrouiller l'orientation.
- **WCAG 2.3.1 / 2.2.2** : pas de clignotement rapide, pas de mouvement
  automatique non contrôlable.
- `prefers-reduced-motion` est déjà géré globalement sous `.site` ; l'étendre à
  l'administration et aux transitions MUI.
- Vérifier le mode contraste élevé / `forced-colors` : les contours de focus,
  bordures de champs et icônes d'état restent visibles. Ne pas utiliser un
  `box-shadow` seul comme indicateur de focus.
- **WCAG 1.4.12** : le texte reste lisible si l'utilisateur augmente
  l'interligne, l'espacement des lettres ou des mots ; éviter les hauteurs
  fixes.

## 9. Spécificités Next.js et React Admin

| Sujet | Règle |
| ----- | ----- |
| `_document.tsx` | `lang="fr"` déjà présent ; le conserver et ajouter `lang` local pour les citations en langue étrangère. |
| `Seo` / `next/head` | Un `title` unique par page ; le changement de titre côté client n'est pas annoncé seul, d'où la gestion du focus décrite en §3. |
| `next/link` | Rend un `<a>` : ne pas imbriquer de bouton ou de lien dans un lien. Utiliser `aria-current="page"` pour l'entrée active. |
| `next/image` | `alt` obligatoire ; `alt=""` pour le décoratif ; `sizes` adapté ; pas d'ancienne prop `layout`. |
| `next/dynamic` | Le fallback de `/admin` a déjà `role="status"` : conserver un texte explicite. Prévoir un `<noscript>` pour l'administration, qui exige JavaScript. |
| `next/script` | Analytics (Plausible) chargé sans bloquer l'interaction ; si un bandeau de consentement existe, il est accessible et ne piège pas le focus. |
| Pages Router | Pas d'annonceur de route intégré (contrairement à l'App Router) : implémenter le focus/annonce dans `_app.tsx`. |
| SSG / SSR | Les pages publiques doivent rester lisibles sans JavaScript. Les formulaires et le simulateur qui en dépendent affichent un message `<noscript>` et, pour les parcours critiques, un fallback serveur. |
| CSS Modules | Le CSS global public est scopé sous `.site` pour ne pas toucher MUI. Ne pas élargir ce reset à l'administration ; ajouter les styles de focus et de mouvement réduit côté admin. |
| MUI / React Admin | `TextField` avec `label` (déjà le cas), `Dialog` pour les modales, `aria-label` sur les boutons icône, `caption`/`aria-sort` sur les tableaux, notifications en région live, focus visible dans le thème. |
| Hydratation | Éviter les écarts `aria-hidden` / focus entre serveur et client ; l'admin est client-only, le public est statique. |
| 404 / 500 | `h1` explicite, message utile, lien vers l'accueil, focus géré. |
| HTML injecté | `dangerouslySetInnerHTML` interdit sans sanitation ; un contenu riche doit conserver une structure sémantique. |

## 10. Cas fonctionnels

### Annonces

- Liste : chaque carte a un lien principal explicite (titre du bien), une image
  avec `alt` descriptif, le prix, la surface et la ville en texte.
- Filtres : `fieldset`/`legend`, labels visibles, résultats annoncés dans une
  région `aria-live="polite"` (« 12 annonces trouvées »).
- Tri : `select` avec label ou boutons avec `aria-pressed` ; l'état courant est
  visible autrement que par la couleur.
- Pagination : `nav aria-label="Pagination"`, page courante `aria-current="page"`.
- Aucun résultat : message textuel explicite, pas seulement une zone vide.
- Fiche : `h1` = titre de l'annonce, galerie d'images accessible, description
  structurée, DPE et honoraires en texte/tableau, CTA contact visible.

### Simulateur de frais

- Champs numériques avec label, unité et aide ; erreurs explicites.
- Résultat en texte, formaté en euros, avec détail (droits, émoluments,
  débours, TVA) et avertissement « estimation indicative ».
- Mise à jour du résultat annoncée poliment, sans recharger la page ni voler le
  focus.
- Si un graphique est ajouté : tableau de données équivalent.

### Prise de rendez-vous

- Motif, notaire et créneau dans des groupes labellisés.
- Créneaux indisponibles : état explicite en texte, pas seulement grisé.
- Date/heure : composant natif ou bibliothèque accessible, navigation clavier
  complète.
- Confirmation dans une région `role="status"` ou une page dédiée avec `h1`.
- Aucun compte à rebours bloquant.

### FAQ, glossaire, actualités

- FAQ : `<details>`/`<summary>` ou accordéon ARIA correct ; titres hiérarchisés.
- Glossaire : `dl` avec `dt`/`dd`.
- Actualités : `article`, `<time datetime>`, ordre de lecture logique.

### Administration

- Connexion : labels, `type="email"`, `autoComplete`, erreurs associées,
  bouton non désactivé tant que le formulaire est incomplet.
- Tableaux : `caption`, en-têtes, tri accessible, actions de ligne nommées.
- Formulaires : mêmes règles que le public ; les erreurs API sont traduites.
- Suppression : dialogue de confirmation nommé, conséquence décrite, focus sur
  « Annuler » par défaut.
- Notifications React Admin : vérifier qu'elles sont annoncées sans voler le
  focus.

### Bandeau de démonstration et consentement

- Le bandeau « site de démonstration » est une région nommée, refermable, sans
  vol de focus au chargement.
- S'il est modal, il suit les règles de dialogue ; sinon, il ne piège pas le
  focus.
- Le contraste du bandeau est vérifié, y compris sur mobile.

## 11. Tests et CI

- `eslint-config-next/core-web-vitals` active déjà les règles `jsx-a11y` de
  base : ne pas les désactiver. Ajouter une règle ou un plugin seulement après
  vérification de l'éditeur et des CVE (règle du projet).
- Tests unitaires Vitest + Testing Library : rôles, labels, focus, dialogue,
  `aria-invalid`, résumé d'erreurs, annonce de route.
- Tests E2E Playwright : parcours clavier (accueil → annonce → contact/RDV),
  ouverture/fermeture de modale, retour du focus, soumission invalide.
- Audit automatisé `axe` (Playwright ou Lighthouse CI) sur chaque page
  publique et sur `/admin/login`. Un score Lighthouse accessibilité élevé ne
  remplace pas les tests manuels.
- Vérifications manuelles :
  - navigation uniquement au clavier ;
  - NVDA + Firefox et VoiceOver + Safari ;
  - zoom 200 % et 400 %, largeur 320 px ;
  - `prefers-reduced-motion` ;
  - contraste élevé / `forced-colors` ;
  - mobile tactile.
- Commandes existantes : `make web-lint`, `make web-typecheck`,
  `make web-test`, `make web-build`. Une cible `make web-a11y` sera ajoutée
  avec les tests dédiés.
- Le noindex SEO est volontaire : un avertissement Lighthouse SEO est attendu
  et ne doit pas être « corrigé » en retirant le noindex.

## 12. Checklist par écran

| Écran | Contrastes | Clavier / focus | Skip / landmarks | Formulaires | Sémantique | Images | Zoom / reflow | Next.js | Admin / MUI |
| ----- | ---------- | --------------- | ---------------- | ----------- | ---------- | ------ | ------------- | ------- | ----------- |
| Accueil | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ | ☐ | N/A |
| Pages thématiques | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ | ☐ | N/A |
| Annonces (liste) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | N/A |
| Annonce (fiche) | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ | ☐ | N/A |
| Simulateur | ☐ | ☐ | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | N/A |
| Prise de rendez-vous | ☐ | ☐ | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | N/A |
| Contact | ☐ | ☐ | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | N/A |
| FAQ / glossaire / actualités | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ | ☐ | N/A |
| Mentions légales / confidentialité | ☐ | ☐ | ☐ | N/A | ☐ | N/A | ☐ | ☐ | N/A |
| 404 / 500 | ☐ | ☐ | ☐ | N/A | ☐ | N/A | ☐ | ☐ | N/A |
| Admin — connexion | ☐ | ☐ | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ |
| Admin — tableau de bord / CRUD | ☐ | ☐ | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ |
| Bandeau démo / consentement | ☐ | ☐ | N/A | N/A | ☐ | N/A | ☐ | ☐ | N/A |

## 13. Écarts connus et plan d'action

| # | Constat | Fichier | Impact | Action |
| - | ------- | ------- | ------ | ------ |
| 1 | `--color-border` à 1,38:1 | `web/styles/globals.css` | Contour de champ ou d'état non perceptible | Décoratif uniquement ; ajouter `--color-border-strong` ≥ 3:1 pour les contrôles |
| 2 | Focus public scopé sous `.site` | `web/styles/globals.css` | L'admin MUI n'a pas le focus personnalisé | Ajouter un focus visible équivalent dans le thème MUI / le CSS admin |
| 3 | Pas d'annonce de changement de route | `web/pages/_app.tsx` | Le lecteur d'écran ne sait pas que la page a changé | Ajouter le focus `h1` ou une région live (§3) |
| 4 | `type="text"` + `inputMode="email"` | `web/admin/LoginPage.tsx` | Sémantique de champ incorrecte | Passer à `type="email"` et compléter `autoComplete` |
| 5 | Erreur de login non associée aux champs | `web/admin/LoginPage.tsx` | L'erreur n'est pas reliée au champ fautif | Ajouter `aria-invalid`, `aria-describedby`, résumé d'erreurs |
| 6 | `main#contenu` sans `tabIndex` | `web/pages/index.tsx` | Le lien d'évitement ne déplace pas toujours le focus | Ajouter `tabIndex={-1}` sur le `main` |
| 7 | Navigation sans `aria-current` | `web/components/layout/PublicLayout.tsx` | Page active non exposée | Ajouter `aria-current="page"` |
| 8 | Liens de corps sans soulignement par défaut | `web/styles/globals.css` | Liens confondus avec le texte | Souligner les liens inline ; garder un focus visible |
| 9 | En-tête sticky sans décalage d'ancre | `web/components/layout/PublicLayout.module.css` | Focus / ancre masqués par l'en-tête | Ajouter `scroll-margin-top` ou `scroll-padding-top` |
| 10 | `prefers-reduced-motion` limité à `.site` | `web/styles/globals.css` | Animations MUI non réduites | Étendre la règle à l'admin / au thème MUI |
| 11 | Pas de test a11y automatisé | `web/` | Régressions non détectées | Ajouter Vitest/Testing Library et axe après revue des dépendances |
| 12 | Tableaux et dialogues React Admin à auditer | `web/admin/` | Risques lors de l'ajout des resources | Checklist MUI : `caption`, `aria-sort`, `Dialog`, boutons icône |

Ces écarts ne bloquent pas la démonstration actuelle mais doivent être traités
avant d'ajouter les formulaires publics, les annonces et les resources
d'administration. Les corrections de code passent par un change OpenSpec dédié.

## 14. Règles de revue et Definition of Done

- Toute évolution d'interface reprend la checklist §12 et documente les points
  testés dans la PR.
- Un composant nouveau (modale, onglets, tableau, champ, notification) fournit
  son API d'accessibilité, ses tests et un exemple d'usage.
- Une revue d'écran ne valide pas si : un contrôle n'est pas atteignable au
  clavier, un champ n'a pas de label, une information repose uniquement sur la
  couleur, le focus est perdu après une action, ou un texte échoue au contraste.
- Les exceptions sont justifiées dans le change OpenSpec ou un ADR, avec une
  alternative et une échéance. « On verra plus tard » n'est pas une exception.
- La maquette est revue avant l'implémentation : structure des titres,
  landmarks, ordre de lecture, états et libellés.
- Ce document est mis à jour dès qu'un nouveau pattern ou une nouvelle page
  modifie les règles.

## Références

- WCAG 2.1 : <https://www.w3.org/TR/WCAG21/>
- WCAG 2.2 : <https://www.w3.org/TR/WCAG22/>
- RGAA 4.1 : <https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/>
- Next.js — Accessibility : <https://nextjs.org/docs/architecture/accessibility>
- MUI — Accessibility : <https://mui.com/material-ui/guides/accessibility/>
