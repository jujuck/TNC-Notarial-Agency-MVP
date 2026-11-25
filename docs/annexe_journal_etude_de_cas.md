# Annexe – Journal de bord : étude de cas « Site d'une étude notariale fictive »

> Candidature : Webdesigner / Développeur Web polyvalent – TNC
> Statut : EN COURS – dernière mise à jour : 25/11/2026

---

## 0. Contraintes de l'énoncé (non négociables)

| #   | Contrainte                                                                             | Conséquence projet                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Toutes les données sont fictives (nom de l'étude, notaires, adresse, coordonnées)      | Vérifier qu'aucun nom/adresse/téléphone/SIRET ne correspond à une réalité (numéros type 01 99 00 xx xx, domaine inexistant)                                      |
| C2  | Aucune photo générée par IA                                                            | Banques d'images libres de droits (photos réelles), photos personnelles, illustrations vectorielles faites main. Tracer la source et la licence de chaque visuel |
| C3  | Livrable = un lien (site en ligne)                                                     | Hébergement gratuit/statique, URL stable, site fonctionnel sur mobile                                                                                            |
| C4  | Critères d'évaluation : qualité de réalisation, rigueur, sens du détail, projet abouti | Priorité au fini (accessibilité, SEO, performance, mentions légales, cohérence) plutôt qu'à la quantité de fonctionnalités                                       |
| C5  | Aucun délai imposé                                                                     | Pas de précipitation : mais cadrer un périmètre réaliste (MVP abouti > ambition inachevée)                                                                       |

Compétences que l'offre veut voir démontrées : maquettes/UI, HTML/CSS/JS, CMS/e-commerce, UX, accessibilité, SEO, analytique, collaboration.

---

## 1. Analyse du besoin et du marché

### 1.1 Que fait une étude notariale ? 🔍

Le notaire est un **officier public et ministériel**, nommé par l'État, qui **authentifie les actes** (force probante et force exécutoire) et conseille ses clients de façon impartiale. Il exerce en étude (individuelle ou société, plusieurs associés/salariés).

Grands domaines d'activité :

| Pôle               | Exemples                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Immobilier**     | Vente/achat, compromis, prêt, servitudes, copropriété, viager, négociation immobilière                                                                       |
| **Famille**        | Mariage et contrat de mariage, PACS, divorce (enregistrement de la convention), concubinage, filiation, protection des proches (mandat de protection future) |
| **Patrimoine**     | Donation, testament, assurance-vie (conseil), optimisation de transmission, SCI                                                                              |
| **Successions**    | Règlement de succession, attestation immobilière, déclaration de succession, partage                                                                         |
| **Entreprise**     | Création de société, cession de parts/fonds, baux commerciaux, pactes d'associés                                                                             |
| **Rural / autres** | Baux ruraux, GFA, urbanisme, droit de l'environnement selon les études                                                                                       |

Spécificités du secteur :

- Tarifs en partie **réglementés**, d'où la forte demande « combien coûtent les frais de notaire ? ».
- Profession **déontologique** : confiance, confidentialité, neutralité. La communication est encadrée (publicité autorisée mais mesurée, pas de démarchage agressif).
- Activité **saisonnière et locale** : marché immobilier, recherche de proximité.
- Digitalisation en cours : signature électronique, actes à distance (visioconférence), plateformes de suivi de dossier fournies par des éditeurs métiers 🔍.

### 1.2 Cibles marketing

| Cible                                                              | Motivation                         | Ce qu'elle cherche sur le site               | Niveau de stress |
| ------------------------------------------------------------------ | ---------------------------------- | -------------------------------------------- | ---------------- |
| **Particuliers acquéreurs/vendeurs**                               | Transaction immobilière            | Délais, frais, pièces à fournir, RDV         | Moyen            |
| **Familles en succession / deuil**                                 | Obligation légale, souvent urgente | Rassurance, étapes, contact humain, empathie | **Élevé**        |
| **Couples (mariage, PACS, donation)**                              | Anticipation                       | Explications claires, tarifs, conseil        | Faible           |
| **Chefs d'entreprise / porteurs de projet**                        | Société, cession, bail             | Expertise, réactivité, références            | Moyen            |
| **Investisseurs / patrimoine**                                     | Optimisation                       | Crédibilité, expertise de niche              | Faible           |
| **Professionnels (agences, banques, avocats, experts-comptables)** | Collaboration                      | Contact direct, process, dépôt de pièces     | Faible           |

Enjeu central : **rassurer, expliquer simplement, faciliter la prise de contact**. Le notaire est un acteur « froid » dans l'imaginaire collectif : le site doit rendre l'étude **accessible sans perdre en sérieux**.

### 1.3 Objectifs d'un site vitrine notarial

1. Établir **la confiance** (qui sommes-nous, qui sont les notaires, où, comment).
2. **Informer** : domaines, étapes, pièces à fournir, FAQ, glossaire.
3. **Convertir** : prise de RDV / demande de contact qualifiée (par thématique).
4. Être **trouvé** : SEO local (« notaire + ville », « succession + ville »), fiche Google Business.
5. **Alléger le travail de l'étude** : réponses aux questions récurrentes, pré-collecte d'informations.
6. Respecter les obligations : mentions légales, RGPD, accessibilité, déontologie.

KPI imaginables (démonstration « analytique ») : taux de demande de RDV, pages les plus vues, requêtes locales, temps de chargement, score accessibilité.

### 1.4 Besoins « ouverts » (au-delà de la vitrine)

Classement par pertinence pour l'étude de cas :

| Fonctionnalité                                                         | Valeur                 | Complexité                                               | Proposition                                                                                                          |
| ---------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Prise de RDV en ligne (par motif, notaire, créneaux)                   | Très forte             | Moyenne                                                  | **MVP** (simulée côté front, sans backend réel ou via service tiers)                                                 |
| Formulaire de contact / demande qualifiée par thématique               | Très forte             | Faible                                                   | **MVP**                                                                                                              |
| Simulateur de frais de notaire (immobilier)                            | Forte (très recherché) | Moyenne                                                  | **MVP+** : estimation indicative, avec avertissement                                                                 |
| FAQ / guides par situation de vie (« je vends », « je suis en deuil ») | Forte (SEO)            | Faible                                                   | **MVP**                                                                                                              |
| Espace client (suivi de dossier, dépôt de pièces, signature)           | Forte en réel          | **Élevée** (sécurité, données sensibles, éditeur métier) | **Maquette cliquable fictive** ou mention « portail sécurisé » : ne pas coder un faux système avec de vraies données |
| Annonces immobilières                                                  | Moyenne                | Moyenne                                                  | Option : 3 biens fictifs                                                                                             |
| Actes à distance / visio                                               | Moyenne                | Faible (page d'explication)                              | Page d'information                                                                                                   |
| Blog / actualités juridiques                                           | Moyenne (SEO)          | Faible                                                   | 2–3 articles                                                                                                         |
| Multilingue                                                            | Faible                 | Moyenne                                                  | À écarter sauf besoin                                                                                                |
| Dépôt sécurisé de documents                                            | Forte en réel          | Élevée                                                   | Hors périmètre, à justifier                                                                                          |

---

### Réflexions et décisions

- l'énoncé évalue la _rigueur_ et le _sens du détail_. Hypothèse retenue : un MVP très fini vaut mieux qu'un site ambitieux inabouti.
- l'absence de site chez TNC suggère de livrer aussi une **documentation légère** (README / note de conception) montrant la démarche, qui sert de preuve de rigueur.

---

## 2. Prochaines étapes

1. Ideation graphique.
2. Benchmark de 8–10 sites d'études notariales (classiques, modernes) → grille d'analyse (structure, UX, SEO, accessibilité, design).
3. Personas + parcours utilisateurs (3 personas prioritaires).

---

## 2. Stratégie démonstrateur

### 2.1 Décisions et fonctionnalités

| ID  | Décision                                                                        | Positionnement                        |
| --- | ------------------------------------------------------------------------------- | ------------------------------------- |
| D1  | Pages statiques SEO : Famille, Patrimoine, Succession, etc.                     | SEO - Balise HTML / CSS               |
| D2  | Back-office de création/gestion d'annonces (vente/location) + front orienté SEO | Maitrise Technique du Web React - PHP |
| D3  | Simulateur (frais de notaire)                                                   | accent algo, UX, acquisition          |
| D4  | Prise de RDV fictive (démontre la prise en compte du besoin)                    | Acquisition - Analytics               |
| D5  | Tracker d'audience alternatif à Google Analytics, conforme RGPD                 | Analytics                             |
| D6  | FAQ orientée SEO                                                                | SEO et balise HTML                    |
| D7  | E-mails transactionnels via Brevo                                               | Acquisition - Analytics               |

### 2.3 Risques et mesures

| #   | Risque                                         | Mesure à mettre en place                                                                                        |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| R1  | Périmètre trop large                           | Socle / bonus, Definition of Done par module                                                                    |
| R2  | Back-office invisible pour l'évaluateur        | Mode démo (identifiants affichés), page « Coulisses » ou courte vidéo                                           |
| R3  | Tracker maison long et risqué                  | Brique open source (Plausible) + événements custom + mini-dashboard - Auto Hebergement ou GA pour gain de temps |
| R4  | Collecte de vraies données dans un site fictif | Bandeau « site de démonstration », politique de confidentialité, purge régulière                                |
| R5  | Faux site notarial indexé                      | SEO complet implémenté mais `noindex` en prod, justifié dans la doc                                             |
| R6  | Annonces : réalisme légal                      | Mentions obligatoires (DPE, honoraires, surface)                                                                |
| R7  | Hébergement du back-end                        | Hébergeur stable PHP/MySQL ou Node durant toute l'évaluation sur OVH                                            |

### 3.4 SEO annonces – checklist de base

URLs lisibles, title/meta uniques, H1 unique, données structurées (schema.org Offer / RealEstateListing), sitemap XML, robots.txt, canonical, pagination, Open Graph, images optimisées (WebP, alt, lazy), fil d'Ariane, maillage interne, performance (Core Web Vitals), gestion des annonces expirées (410/redirection), opengraph, indexation google Console

### 3.5 Simulateur – points à clarifier pour contexte réaliste

Ancien vs neuf, taux de droits de mutation selon le département, barème des émoluments proportionnels, contribution de sécurité immobilière, débours, TVA. Avertissement « estimation indicative ». Capture de lead (résultat par e-mail + proposition de RDV) avec consentement explicite.

---

## 4. Infrastructure

### 4.1 Décisions ✅

| ID  | Décision                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| D8  | Hébergement : VPS personnel, back PHP, front NextJs, MySQL sous Docker, sous-domaine dédié                         |
| D9  | Versionning GitHub, déploiement CI/CD via script bash                                                              |
| D10 | E-mails via Brevo                                                                                                  |
| D11 | Production en `noindex` (SEO implémenté, indexation désactivée)                                                    |
| D12 | Démo : note de documentation envoyée avec l'URL par e-mail (identifiants du back-office dans la note, non publics) |

### 4.2 Point critique : React et SEO

Une SPA React classique (rendu côté client) est défavorable au SEO et pénalise l'évaluation (Lighthouse, aperçu sans JS, balises dynamiques). Pour des annonces qui doivent « remonter », il faut du **rendu serveur ou pré-rendu** :
| Option | Avantages | Inconvénients |
|---|---|---|
| Next.js (SSR/SSG/ISR) + API PHP | Meilleur SEO, standard du marché, balises/données structurées dynamiques | Conteneur Node supplémentaire, 2 langages serveur |

### 4.3 Sécurité minimale du back-office

HTTPS (Let's Encrypt), mots de passe hachés (argon2/bcrypt), requêtes préparées, protection CSRF, limitation des tentatives de connexion, validation des uploads (type, taille, renommage), secrets hors dépôt (`.env`), sauvegarde MySQL, en-têtes de sécurité (CSP, HSTS), check de supply chain trivy.

### 4.4 Éléments de cadrage complémentaires

**A. Gouvernance et qualité (preuves de rigueur)**

- Definition of Done commune : fonctionnel, responsive, accessible, testé, documenté, déployé.
- Git : branches courtes + PR (même seul), commits conventionnels, CHANGELOG, tags de version.
- GitHub Projects (kanban) + issues liées aux user stories du PRD.
- Décisions d'architecture tracées (ADR courts dans `docs/`), alimentées par ce journal.

**B. Architecture**

- Monorepo (`/api`, `/web`, `/infra`, `/docs`) à confirmer.
- Reverse proxy (Nginx) + HTTPS ; conteneurs : web (Node), api (PHP-FPM), db (MySQL), mailer de dev.
- Contrat d'API documenté (OpenAPI).
- **Lien BO → SEO** : publication/modification d'une annonce déclenche la revalidation (ISR/on-demand) des pages concernées, sitemap régénéré.
- Gestion des images : upload sécurisé, redimensionnement, WebP, `alt` obligatoire.
- Authentification du BO (sessions sécurisées côté API), rôles (admin / démo limité).

**C. Exploitation**

- Environnements : dev local via Docker Compose, prod sur VPS (staging optionnel).
- Script de déploiement bash : build, migrations, healthcheck, **rollback**.
- Sauvegarde MySQL, supervision simple (uptime), journaux.
- Compte démo à droits limités + **jeu de données de démonstration réinitialisable** (seed + script/cron de reset).
- Disponibilité : site maintenu en ligne plusieurs semaines (aucun délai de revue imposé).

**D. Tests automatisés (économiques et visibles)**

- Tests unitaires du simulateur (cas de référence documentés, cas limites).
- Parcours E2E de base (annonce → fiche → RDV ; simulateur) ex. Playwright.
- Lighthouse CI + contrôle d'accessibilité dans la CI GitHub Actions.

**E. Non-fonctionnel**

- Budgets de performance (Core Web Vitals), accessibilité WCAG 2.1 AA, navigateurs cibles, responsive mobile-first.
- Pages légales : mentions légales (fictives et signalées), politique de confidentialité, gestion des cookies selon le tracker retenu.
- Bandeau « site de démonstration », données réelles minimisées et purgées.

**F. Contenu et SEO**

- Recherche de mots-clés locaux (ville + service) ; plan de contenu (≈ 10–15 pages) ; ton et vouvoiement.
- Contenus juridiques : sources citées, mention « informations générales, non contractuelles », relecture.

**G. Livraison**

- E-mail de candidature : lien du site + note de documentation (2 pages) + lien du dépôt public.
- Parcours conseillé en 5 minutes dans la note ; critères de réussite côté recruteur.
- Capacité à défendre chaque choix technique en entretien (le dépôt public sera lu).
