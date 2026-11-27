# Spec Delta

## Purpose

Définir les comportements d'accessibilité transverses du site public et de
l'administration de démonstration, afin que les parcours restent utilisables au
clavier, au lecteur d'écran, au zoom et avec un mouvement réduit.

## ADDED Requirements

### Requirement: Contrast and non-color information

Les textes, composants d'interface et éléments graphiques porteurs
d'information SHALL respecter les seuils WCAG 2.1 AA : 4,5:1 pour le texte
normal, 3:1 pour le texte large, les composants et les graphiques. Aucune
information SHALL être transmise par la couleur seule.

#### Scenario: Texte et contrôles conformes

- **WHEN** un écran est analysé avec un contrôle de contraste
- **THEN** chaque texte atteint 4,5:1 (ou 3:1 s'il est large) et chaque contour de contrôle ou icône informative atteint 3:1

#### Scenario: État non porté par la couleur

- **WHEN** une erreur, un succès ou un état sélectionné est affiché
- **THEN** un libellé texte ou une icône accompagnée d'un texte permet de l'identifier sans percevoir la couleur

### Requirement: Visible keyboard focus

Chaque élément interactif SHALL être atteignable au clavier et SHALL afficher
un indicateur de focus visible, y compris dans l'administration. L'indicateur
SHALL rester visible lorsqu'un en-tête sticky ou un bandeau est présent.

#### Scenario: Parcours au clavier

- **WHEN** un utilisateur parcourt un écran avec Tab et Shift+Tab
- **THEN** chaque contrôle reçoit le focus dans un ordre logique et affiche un indicateur visible

#### Scenario: Focus non masqué

- **WHEN** un élément proche d'un en-tête sticky reçoit le focus ou est ciblé par une ancre
- **THEN** l'élément et son indicateur de focus restent entièrement visibles

### Requirement: Route change announcement

Lors d'une navigation client entre deux pages, le système SHALL informer les
technologies d'assistance du changement de page, soit en déplaçant le focus sur
le titre principal, soit en annonçant le titre dans une région live, sans double
annonce.

#### Scenario: Navigation entre deux pages

- **WHEN** un utilisateur active un lien interne et que la nouvelle page est rendue
- **THEN** le focus est placé sur le titre principal ou le titre est annoncé une seule fois

### Requirement: Skip link and landmarks

Chaque page SHALL fournir un lien d'évitement vers le contenu principal, premier
élément focusable, et SHALL exposer les landmarks principaux (`header`, `nav`,
`main`, `footer`). L'activation du lien SHALL déplacer le focus dans le contenu
principal.

#### Scenario: Activation du lien d'évitement

- **WHEN** un utilisateur active « Aller au contenu » au clavier
- **THEN** le focus est placé sur le contenu principal et la suite de la tabulation reprend dans ce contenu

#### Scenario: Landmarks identifiables

- **WHEN** la page est parcourue par landmarks
- **THEN** l'en-tête, la navigation principale, le contenu principal et le pied de page sont exposés avec des noms distincts

### Requirement: Accessible forms

Chaque champ SHALL avoir un libellé visible et associé. Les erreurs SHALL être
identifiées par du texte, associées au champ concerné et annoncées ; le résumé
d'erreurs SHALL recevoir le focus à la soumission invalide. Le bouton de
soumission MUST NOT être désactivé du seul fait que le formulaire est incomplet.

#### Scenario: Champ invalide

- **WHEN** un utilisateur soumet un formulaire avec un champ invalide
- **THEN** le champ porte un état invalide, son message d'erreur est associé et le focus est placé sur le résumé des erreurs

#### Scenario: Formulaire incomplet

- **WHEN** un formulaire est affiché avec des champs vides
- **THEN** le bouton de soumission reste actif et une soumission invalide produit des messages compréhensibles

### Requirement: Images and icons

Les images informatives SHALL avoir un texte alternatif contextuel ; les images
décoratives SHALL être ignorées par les technologies d'assistance. Les icônes
utilisées seules dans un contrôle SHALL ne pas constituer le nom accessible du
contrôle.

#### Scenario: Image informative

- **WHEN** une image porte une information utile
- **THEN** son texte alternatif décrit cette information

#### Scenario: Icône décorative

- **WHEN** une icône double un texte déjà présent
- **THEN** elle est masquée aux technologies d'assistance

### Requirement: Zoom, reflow and reduced motion

Le contenu SHALL rester utilisable à 200 % de taille de texte et à 400 % de zoom
sans scroll horizontal hors tableaux de données. Les animations non essentielles
SHALL être réduites ou supprimées lorsque l'utilisateur préfère un mouvement
réduit.

#### Scenario: Zoom élevé

- **WHEN** la page est affichée à 400 % de zoom sur une largeur de 320 px
- **THEN** le contenu reste lisible et utilisable sans défilement horizontal, hors tableaux de données

#### Scenario: Mouvement réduit

- **WHEN** le système demande un mouvement réduit
- **THEN** les animations et transitions non essentielles sont réduites ou désactivées, y compris dans l'administration

### Requirement: Automated accessibility checks

Le projet SHALL fournir des vérifications automatisées d'accessibilité sur les
pages publiques et la page de connexion de l'administration, en complément des
vérifications manuelles.

#### Scenario: Exécution des contrôles

- **WHEN** la suite de tests d'accessibilité est exécutée
- **THEN** elle contrôle les rôles, les libellés, le focus, les erreurs de formulaire et les violations détectables par un audit automatisé, et échoue en cas de régression
