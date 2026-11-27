# Annexe – Journal de bord : étude de cas « Site d'une étude notariale fictive »

> Candidature : Webdesigner / Développeur Web polyvalent – TNC
> Statut : EN COURS – dernière mise à jour : 24/11/2026
> Légende : ✅ validé · 🟡 hypothèse à valider · ❓ question ouverte · 🔍 à vérifier (source externe)

---

## 0. Contraintes de l'énoncé (non négociables)

| # | Contrainte | Conséquence projet |
|---|-----------|--------------------|
| C1 | Toutes les données sont fictives (nom de l'étude, notaires, adresse, coordonnées) | Vérifier qu'aucun nom/adresse/téléphone/SIRET ne correspond à une réalité (numéros type 01 99 00 xx xx, domaine inexistant) |
| C2 | Aucune photo générée par IA | Banques d'images libres de droits (photos réelles), photos personnelles, illustrations vectorielles faites main. Tracer la source et la licence de chaque visuel |
| C3 | Livrable = un lien (site en ligne) | Hébergement gratuit/statique, URL stable, site fonctionnel sur mobile |
| C4 | Critères d'évaluation : qualité de réalisation, rigueur, sens du détail, projet abouti | Priorité au fini (accessibilité, SEO, performance, mentions légales, cohérence) plutôt qu'à la quantité de fonctionnalités |
| C5 | Aucun délai imposé | Pas de précipitation : mais cadrer un périmètre réaliste (MVP abouti > ambition inachevée) |

Compétences que l'offre veut voir démontrées : maquettes/UI, HTML/CSS/JS, CMS/e-commerce, UX, accessibilité, SEO, analytique, collaboration.
👉 Le site doit donc montrer chacune de ces compétences de façon visible.

---

## 1. Analyse du besoin et du marché

### 1.1 Que fait une étude notariale ? 🔍

Le notaire est un **officier public et ministériel**, nommé par l'État, qui **authentifie les actes** (force probante et force exécutoire) et conseille ses clients de façon impartiale. Il exerce en étude (individuelle ou société, plusieurs associés/salariés).

Grands domaines d'activité :

| Pôle | Exemples |
|------|----------|
| **Immobilier** | Vente/achat, compromis, prêt, servitudes, copropriété, viager, négociation immobilière |
| **Famille** | Mariage et contrat de mariage, PACS, divorce (enregistrement de la convention), concubinage, filiation, protection des proches (mandat de protection future) |
| **Patrimoine** | Donation, testament, assurance-vie (conseil), optimisation de transmission, SCI |
| **Successions** | Règlement de succession, attestation immobilière, déclaration de succession, partage |
| **Entreprise** | Création de société, cession de parts/fonds, baux commerciaux, pactes d'associés |
| **Rural / autres** | Baux ruraux, GFA, urbanisme, droit de l'environnement selon les études |

Spécificités du secteur :
- Tarifs en partie **réglementés** (émoluments), d'où la forte demande « combien coûtent les frais de notaire ? ».
- Profession **déontologique** : confiance, confidentialité, neutralité. La communication est encadrée 🔍 (publicité autorisée mais mesurée, pas de démarchage agressif).
- Activité **saisonnière et locale** : marché immobilier, recherche de proximité.
- Digitalisation en cours : signature électronique, actes à distance (visioconférence), plateformes de suivi de dossier fournies par des éditeurs métiers 🔍.

### 1.2 Cibles marketing 🟡

| Cible | Motivation | Ce qu'elle cherche sur le site | Niveau de stress |
|-------|-----------|--------------------------------|------------------|
| **Particuliers acquéreurs/vendeurs** | Transaction immobilière | Délais, frais, pièces à fournir, RDV | Moyen |
| **Familles en succession / deuil** | Obligation légale, souvent urgente | Rassurance, étapes, contact humain, empathie | **Élevé** |
| **Couples (mariage, PACS, donation)** | Anticipation | Explications claires, tarifs, conseil | Faible |
| **Chefs d'entreprise / porteurs de projet** | Société, cession, bail | Expertise, réactivité, références | Moyen |
| **Investisseurs / patrimoine** | Optimisation | Crédibilité, expertise de niche | Faible |
| **Professionnels (agences, banques, avocats, experts-comptables)** | Collaboration | Contact direct, process, dépôt de pièces | Faible |
| **Candidats (recrutement)** | Rejoindre l'étude | Page carrière / contact | – |

Enjeu central : **rassurer, expliquer simplement, faciliter la prise de contact**. Le notaire est un acteur « froid » dans l'imaginaire collectif : le site doit rendre l'étude **accessible sans perdre en sérieux**.

### 1.3 Objectifs d'un site vitrine notarial 🟡

1. Établir **la confiance** (qui sommes-nous, qui sont les notaires, où, comment).
2. **Informer** : domaines, étapes, pièces à fournir, FAQ, glossaire.
3. **Convertir** : prise de RDV / demande de contact qualifiée (par thématique).
4. Être **trouvé** : SEO local (« notaire + ville », « succession + ville »), fiche Google Business.
5. **Alléger le travail de l'étude** : réponses aux questions récurrentes, pré-collecte d'informations.
6. Respecter les obligations : mentions légales, RGPD, accessibilité, déontologie.

KPI imaginables (démonstration « analytique ») : taux de demande de RDV, pages les plus vues, requêtes locales, temps de chargement, score accessibilité.

### 1.4 Besoins « ouverts » (au-delà de la vitrine) 🟡

Classement par pertinence pour l'étude de cas :

| Fonctionnalité | Valeur | Complexité | Proposition |
|---|---|---|---|
| Prise de RDV en ligne (par motif, notaire, créneaux) | Très forte | Moyenne | **MVP** (simulée côté front, sans backend réel ou via service tiers) |
| Formulaire de contact / demande qualifiée par thématique | Très forte | Faible | **MVP** |
| Simulateur de frais de notaire (immobilier) | Forte (très recherché) | Moyenne | **MVP+** : estimation indicative, avec avertissement |
| FAQ / guides par situation de vie (« je vends », « je suis en deuil ») | Forte (SEO) | Faible | **MVP** |
| Espace client (suivi de dossier, dépôt de pièces, signature) | Forte en réel | **Élevée** (sécurité, données sensibles, éditeur métier) | **Maquette cliquable fictive** ou mention « portail sécurisé » : ne pas coder un faux système avec de vraies données |
| Annonces immobilières | Moyenne | Moyenne | Option : 3 biens fictifs |
| Actes à distance / visio | Moyenne | Faible (page d'explication) | Page d'information |
| Blog / actualités juridiques | Moyenne (SEO) | Faible | 2–3 articles |
| Multilingue | Faible | Moyenne | À écarter sauf besoin |
| Dépôt sécurisé de documents | Forte en réel | Élevée | Hors périmètre, à justifier |

---

## 2. Codes et charte graphique de la profession 🟡 (à enrichir par benchmark)

### 2.1 Codes classiques observés dans le secteur

- **Palette** : bleu marine, bordeaux, vert profond, or/doré, crème, blanc, noir. Teintes sobres, institutionnelles.
- **Typographie** : serif pour les titres (Garamond, Playfair, Cormorant, Libre Baskerville…) + sans-serif lisible pour le texte.
- **Symboles** : balance, colonnes, plume, sceau, blason, armoiries, parchemin, clés (patrimoine).
- **Photographie** : bureau, poignée de main, signature au stylo, façades haussmanniennes, intérieurs boisés, couples/familles souriants. Tendance récente : photos plus humaines, lumineuses.
- **Ton** : formel, vouvoiement, rassurant, vocabulaire juridique simplifié.
- **Structure type** : Accueil · L'étude · Les notaires · Domaines/Services · Honoraires · Actualités · Contact/RDV.
- **Mentions** : chambre des notaires, ordre, médiateur, déontologie.

### 2.2 Tendances de renouvellement
Études « nouvelle génération » : palettes plus claires, typographies modernes, parcours par situation de vie, photos d'équipe naturelles, mise en avant du digital et de la transparence tarifaire.

### 2.3 Positionnement à choisir
❓ Voir question Q3 ci-dessous : **classique institutionnel** vs **moderne accessible** vs **hybride** (recommandation provisoire : hybride, solennité maîtrisée + lisibilité moderne).

---

## 3. Journal des questions / réponses / décisions

| ID | Question | Réponse / décision | Statut |
|----|----------|--------------------|--------|
| Q1 | Quelle est l'identité de l'étude fictive : taille (1 notaire seul / 3 associés + collaborateurs), ville ou région, spécialités ? | _en attente_ | ❓ |
| Q2 | Périmètre technique : site statique (HTML/CSS/JS) ou CMS (WordPress) pour démontrer l'usage CMS demandé par l'offre ? | _en attente_ | ❓ |
| Q3 | Positionnement visuel : classique / moderne / hybride ? | _en attente_ (reco : hybride) | ❓ |
| Q4 | Quelle ambition pour les fonctionnalités « applicatives » : prise de RDV fonctionnelle, simulateur de frais, maquette d'espace client ? | _en attente_ (reco : RDV + simulateur + maquette espace client) | ❓ |
| Q5 | Source des visuels (banques libres, photos personnelles) et logo à créer soi-même ? | _en attente_ | ❓ |
| Q6 | Hébergement et nom de domaine pour livrer le lien ? | _en attente_ | ❓ |
| Q7 | Outils maîtrisés / à valoriser (Figma, Git, React, PHP…) ? | _en attente_ | ❓ |

### Réflexions et décisions
- 24/11/2026 : l'énoncé évalue la *rigueur* et le *sens du détail*. Hypothèse retenue : un MVP très fini vaut mieux qu'un site ambitieux inabouti.
- 24/11/2026 : l'absence de site chez TNC suggère de livrer aussi une **documentation légère** (README / note de conception) montrant la démarche, qui sert de preuve de rigueur.

---

## 4. Prochaines étapes

1. Répondre à Q1–Q7 (une à la fois).
2. Benchmark de 8–10 sites d'études notariales (classiques, modernes) → grille d'analyse (structure, UX, SEO, accessibilité, design).
3. Personas + parcours utilisateurs (3 personas prioritaires).
4. **PRD** : objectifs, périmètre MVP / hors périmètre, arborescence, user stories, exigences non fonctionnelles (RGAA, performance, SEO, RGPD), critères d'acceptation, risques.
5. Wireframes → charte graphique → maquettes Figma → intégration → recette → mise en ligne.

---

## 5. Sources et points à vérifier 🔍
- Cadre déontologique de la communication des notaires (Conseil supérieur du notariat).
- Règles d'émoluments et frais de notaire (barème réglementé en vigueur).
- Actes à distance / signature électronique (cadre légal actuel).
- Mentions légales obligatoires pour une étude notariale.
- RGAA : niveau d'accessibilité visé.

---

## 6. Session 2 – Stratégie démonstrateur (24/11/2026)

### 6.1 Décisions utilisateur ✅
| ID | Décision |
|----|----------|
| D1 | Back-office de création/gestion d'annonces (vente/location) + front orienté SEO |
| D2 | Simulateur (frais de notaire) : accent algo, UX, acquisition |
| D3 | FAQ orientée SEO |
| D4 | Prise de RDV fictive (démontre la prise en compte du besoin) |
| D5 | Pages statiques SEO : Famille, Patrimoine, Succession, etc. |
| D6 | Tracker d'audience alternatif à Google Analytics, conforme RGPD |
| D7 | E-mails transactionnels via Sendinblue (désormais **Brevo**) |

### 6.2 Évaluation de la stratégie (réflexion Claude) 🟡
- Verdict : cohérente avec l'offre (CMS, PHP/MySQL, SEO, analytique, UX) et différenciante. Risque principal : dispersion vs critère « projet abouti ».
- Recommandation : **socle fini** (identité + pages + SEO + annonces/BO + simulateur) puis **bonus** (tracker, e-mails avancés, RDV enrichi).

### 6.3 Risques et mesures
| # | Risque | Mesure proposée |
|---|--------|-----------------|
| R1 | Périmètre trop large | Socle / bonus, Definition of Done par module |
| R2 | Back-office invisible pour l'évaluateur | Mode démo (identifiants affichés), page « Coulisses » ou courte vidéo |
| R3 | Tracker maison long et risqué | Brique open source (Matomo/Umami/Plausible) + événements custom + mini-dashboard ; config RGPD documentée 🔍 exemption CNIL |
| R4 | Nom Sendinblue obsolète | Parler de Brevo ; double opt-in ; expéditeur fictif cohérent |
| R5 | Collecte de vraies données dans un site fictif | Bandeau « site de démonstration », politique de confidentialité, purge régulière |
| R6 | Faux site notarial indexé | SEO complet implémenté mais `noindex` en prod, justifié dans la doc |
| R7 | Annonces : réalisme légal | Mentions obligatoires (DPE, honoraires, surface) 🔍 ; location secondaire pour un notaire 🔍 |
| R8 | Hébergement du back-end | Hébergeur stable PHP/MySQL ou Node durant toute l'évaluation |

### 6.4 SEO annonces – checklist de base 🟡
URLs lisibles, title/meta uniques, H1 unique, données structurées (schema.org Offer / RealEstateListing), sitemap XML, robots.txt, canonical, pagination, Open Graph, images optimisées (WebP, alt, lazy), fil d'Ariane, maillage interne, performance (Core Web Vitals), gestion des annonces expirées (410/redirection).

### 6.5 Simulateur – points à cadrer 🔍
Ancien vs neuf, taux de droits de mutation selon le département, barème des émoluments proportionnels, contribution de sécurité immobilière, débours, TVA. Avertissement « estimation indicative ». Capture de lead (résultat par e-mail + proposition de RDV) avec consentement explicite.

### 6.6 Questions ouvertes
| ID | Question | Réponse | Statut |
|----|----------|---------|--------|
| Q1 | Identité de l'étude fictive (taille, ville, spécialités) | | ❓ |
| Q2 | Stack technique (PHP/MySQL, Node, WordPress headless, React…) et compétences à valoriser | | ❓ |
| Q3 | Positionnement visuel (classique / moderne / hybride) | | ❓ |
| Q5 | Source des visuels et création du logo | | ❓ |
| Q6 | Hébergement et nom de domaine | | ❓ |
| Q8 | Tracker : intégrer une brique open source ou construire ? | Reco : intégrer + personnaliser | ❓ |
| Q9 | Mode démo du back-office : identifiants publics, vidéo, page « Coulisses » ? | Reco : mode démo + Coulisses | ❓ |
| Q10 | Indexation : `noindex` en prod avec démonstration du SEO ? | Reco : oui | ❓ |

---

## 7. Session 3 – Infrastructure, livraison, calendrier (24/11/2026)

### 7.1 Décisions ✅
| ID | Décision |
|----|----------|
| D8 | Hébergement : VPS personnel, back PHP, front React, MySQL sous Docker, sous-domaine dédié |
| D9 | Versionning GitHub, déploiement CI/CD via script bash |
| D10 | E-mails via Brevo (ex-Sendinblue) |
| D11 | Production en `noindex` (SEO implémenté, indexation désactivée) |
| D12 | Démo : note de documentation envoyée avec l'URL par e-mail (identifiants du back-office dans la note, non publics) |
| D13 | Délai personnel : 1 semaine |

### 7.2 Point critique : React et SEO 🟡
Une SPA React classique (rendu côté client) est défavorable au SEO et pénalise l'évaluation (Lighthouse, aperçu sans JS, balises dynamiques). Pour des annonces qui doivent « remonter », il faut du **rendu serveur ou pré-rendu** :
| Option | Avantages | Inconvénients |
|---|---|---|
| Next.js (SSR/SSG/ISR) + API PHP | Meilleur SEO, standard du marché, balises/données structurées dynamiques | Conteneur Node supplémentaire, 2 langages serveur |
| Vite + pré-rendu (statique) | Léger | Annonces dynamiques mal servies |
| Rendu 100 % PHP (Twig/Blade) + React en îlots (simulateur, RDV) | SEO natif, très simple | Moins de démonstration React |
**Reco provisoire : Next.js pour le front public, API PHP + back-office, MySQL Docker.**

### 7.3 Décision `noindex` – précisions techniques
- Utiliser `<meta name="robots" content="noindex, nofollow">` et l'en-tête `X-Robots-Tag`.
- **Ne pas** bloquer par `robots.txt` (`Disallow`) : le robot ne verrait jamais le noindex et les audits SEO ne pourraient pas explorer le site.
- Variable d'environnement `SITE_INDEXABLE=false` documentée : bascule en une ligne pour la mise en production réelle.
- Sitemap et données structurées restent générés.

> **Mise à jour du 26/11/2026** : la variable `SITE_INDEXABLE` est abandonnée.
> Le noindex devient permanent et sans interrupteur (constante applicative et
> en-tête HTTP), conformément à l'ADR `0003-noindex-permanent.md`. Voir la
> session 11.

### 7.4 Sécurité minimale du back-office
HTTPS (Let's Encrypt), mots de passe hachés (argon2/bcrypt), requêtes préparées, protection CSRF, limitation des tentatives de connexion, validation des uploads (type, taille, renommage), secrets hors dépôt (`.env`), sauvegarde MySQL, en-têtes de sécurité (CSP, HSTS).

### 7.5 Note de documentation (contenu cible, 2 pages max)
1. Contexte et objectifs ; 2. Liens (site, back-office, identifiants démo) ; 3. Parcours à tester (5 min) ; 4. Architecture et choix techniques ; 5. SEO (checklist, noindex et pourquoi) ; 6. RGPD (tracker, e-mails, données de démo) ; 7. Limites et pistes d'évolution ; 8. Crédits visuels et licences ; 9. Dépôt GitHub.

### 7.6 Tracker
Reco : **Matomo** (PHP/MySQL, cohérent avec la stack, configuration sans consentement possible sous conditions 🔍 CNIL) + événements personnalisés (simulateur, RDV, annonces). Alternative Umami/Plausible 🔍 selon compatibilité base de données. Classé **bonus** si le calendrier dérape.

### 7.7 Planning indicatif sur 1 semaine (à ajuster)
| Jour | Objectif | Livrable de sortie |
|---|---|---|
| J1 | Identité (nom, logo, palette, typographies), maquettes clés, Docker + CI/CD + domaine + HTTPS ; vérification des règles du simulateur 🔍 | Squelette déployé, charte validée |
| J2 | Layout, pages statiques (Famille, Patrimoine, Succession, L'étude, Contact), SEO de base | Pages en ligne, Lighthouse correct |
| J3 | Base de données, API PHP, back-office (CRUD annonces, images, statuts) | BO fonctionnel |
| J4 | Front annonces (liste, filtres, fiche), SEO annonces, données structurées, sitemap | Annonces indexables (noindex actif) |
| J5 | Simulateur (algo, UX, capture de lead) | Simulateur testé |
| J6 | RDV fictif + Brevo (double opt-in, confirmation) + FAQ SEO ; tracker si temps | Parcours de conversion complet |
| J7 | Recette : accessibilité, performance, responsive, RGPD, mentions légales ; note de documentation ; e-mail | Livraison |

**Lignes de coupe si retard** (dans cet ordre) : tracker → enrichissements RDV → filtres avancés → FAQ étendue. Intouchables : design cohérent, annonces + BO, simulateur, SEO, documentation.

### 7.8 Questions ouvertes (mise à jour)
| ID | Question | Réponse | Statut |
|----|----------|---------|--------|
| Q1 | Identité de l'étude fictive (taille, ville, spécialités) | | ❓ |
| Q2 | Front : Next.js (SSR) ou alternative ? | Reco : Next.js | ❓ |
| Q3 | Positionnement visuel | Reco : hybride | ❓ |
| Q5 | Visuels et logo | | ❓ |
| Q8 | Tracker | Reco : Matomo, en bonus | ❓ |

---

## 8. Session 4 – Validation du front et points restant à clarifier (24/11/2026)

### 8.1 Décision ✅
| ID | Décision |
|----|----------|
| D14 | Front public : **Next.js** (SSR/SSG/ISR) consommant l'API PHP ; justification : pertinence avec l'annonce (React) et exigence SEO des annonces |

### 8.2 Points à clarifier avant J1 (bloquants)
| ID | Sujet | Détail | Statut |
|----|-------|--------|--------|
| Q1 | Identité de l'étude | Nom (vérifier absence d'homonyme réel), ville/région, nombre de notaires, spécialités | ❓ |
| Q3/Q5 | Direction visuelle et visuels | Classique/moderne/hybride ; logo ; banque d'images libres, licences tracées | ❓ |
| Q11 | Périmètre du simulateur | Ancien seul ou ancien + neuf ; départements couverts ; règles et barèmes à vérifier 🔍 | ❓ |
| Q12 | Modèle de données des annonces | Champs (type, prix, surface, pièces, DPE/GES, localisation, honoraires, statut…), vente seule ou vente + location, nombre d'annonces fictives | ❓ |
| Q13 | Dépôt GitHub | Public (code visible) ou privé (accès à donner) ? Aucun secret dans l'historique | ❓ |
| Q14 | Brevo : expéditeur | Domaine/sous-domaine à authentifier (SPF, DKIM, DMARC) : délai DNS à lancer dès J1 | ❓ |

### 8.3 Points à clarifier en cours de route
| ID | Sujet | Statut |
|----|-------|--------|
| Q15 | Fonctionnement du RDV (motifs, notaire, créneaux, confirmation, annulation) et durée de conservation des données | ❓ |
| Q16 | Niveau d'accessibilité visé (WCAG 2.1 AA / RGAA) et cibles de performance (Lighthouse) | ❓ |
| Q17 | Rédaction des contenus juridiques (FAQ, pages métiers) : sources, relecture, mention « informations générales » | ❓ |
| Q18 | Maquettes Figma : quelles pages en haute fidélité vs wireframes ? | ❓ |
| Q8 | Tracker Matomo : conservé en bonus ? | ❓ |

---

## 9. Session 5 – Compléments de cadrage projet (24/11/2026)

### 9.1 Décisions ✅
| ID | Décision | Conséquences |
|----|----------|--------------|
| D15 | Dépôt GitHub **public** (Q13 clos) | Aucun secret dans l'historique (`.env.example`, secrets GitHub Actions), scan de secrets avant le premier push, licence du dépôt à choisir, visuels uniquement sous licence compatible ou exclus du dépôt, README soigné |
| D16 | **Brevo en standby** (Q14 reporté) | Couche d'envoi d'e-mails abstraite (interface « Mailer ») : implémentation de dev (Mailpit) + mode « journalisé », Brevo branchable plus tard sans refonte ; DNS (SPF/DKIM/DMARC) non lancé pour l'instant |

### 9.2 Éléments de cadrage complémentaires

**A. Gouvernance et qualité (preuves de rigueur)**
- Definition of Done commune : fonctionnel, responsive, accessible, testé, documenté, déployé.
- Git : branches courtes + PR (même seul), commits conventionnels, CHANGELOG, tags de version.
- GitHub Projects (kanban) + issues liées aux user stories du PRD.
- Décisions d'architecture tracées (ADR courts dans `docs/`), alimentées par ce journal.

**B. Architecture**
- Monorepo (`/api`, `/web`, `/infra`, `/docs`) à confirmer.
- Reverse proxy (Nginx/Caddy/Traefik) + HTTPS ; conteneurs : web (Node), api (PHP-FPM), db (MySQL), mailer de dev.
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

### 9.3 Nouvelles questions
| ID | Question | Statut |
|----|----------|--------|
| Q19 | API PHP : framework (Slim, Laravel, Symfony) ou PHP natif structuré ? | ❓ |
| Q20 | Monorepo ou deux dépôts ? Licence du dépôt public ? | ❓ |
| Q21 | Nom de domaine/sous-domaine de démo (ne doit pas évoquer une étude réelle) | ❓ |
| Q22 | Seuil de qualité de la CI (scores Lighthouse, a11y) | ❓ |

---

## 10. Session 6 – Choix API et stratégie de tests (24/11/2026)

### 10.1 Décisions ✅
| ID | Décision | Conséquences |
|----|----------|--------------|
| D17 | API PHP avec **Slim** (Q19 clos) | Micro-framework : routage, middlewares (auth, CSRF, CORS, rate limiting), injection de dépendances (PHP-DI), PDO avec requêtes préparées, migrations (ex. Phinx) ou scripts SQL versionnés, validation d'entrées explicite |
| D18 | **Pas de tests E2E** (coût/temps) | Compensation légère : voir 10.2 |

### 10.2 Stratégie de tests allégée (révisée)
| Niveau | Contenu | Priorité |
|--------|---------|----------|
| Unitaire | Simulateur (cas de référence, cas limites, arrondis) ; règles de validation des annonces | Haute |
| Intégration API | Quelques tests Slim sur les routes critiques (auth BO, création/publication d'annonce) | Moyenne (si temps) |
| Qualité automatisée | Lighthouse CI (perf, a11y, SEO, bonnes pratiques) sur pages clés | Haute |
| Smoke test de déploiement | Script bash du healthcheck : appels HTTP (accueil, une fiche annonce, API santé, sitemap, en-tête noindex) avec rollback si échec | Haute |
| Manuel | Checklist de recette J7 (parcours simulateur, RDV, BO) documentée dans le dépôt | Haute |

### 10.3 Valeurs par défaut proposées (à confirmer)
| ID | Sujet | Proposition | Statut |
|----|-------|-------------|--------|
| Q20 | Dépôt | Monorepo ; licence MIT pour le code (visuels sous leurs licences propres, listées dans `CREDITS.md`) | 🟡 |
| Q21 | Domaine de démo | Sous-domaine neutre non évocateur d'une étude réelle | ❓ |
| Q22 | Seuils CI | Lighthouse ≥ 90 (perf, a11y, SEO, bonnes pratiques) sur desktop, ≥ 80 perf mobile | 🟡 |

---

## 11. Session 7 – Socle web Next.js et noindex permanent (26/11/2026)

### 11.1 Décisions ✅
| ID | Décision | Conséquences |
|----|----------|--------------|
| D19 | Next.js **Pages Router** en sortie `standalone`, Node 24 LTS | SSR/ISR, catch-all `/admin`, montage client-only de React Admin |
| D20 | Périmètre du change `add-web-platform` : **accueil + `/admin/login` + `/admin`** | Annonces, simulateur, RDV, contact, espace client, carrières, glossaire et plan du site reportés |
| D21 | **Noindex permanent sans variable** (remplace `SITE_INDEXABLE=false`) | Meta `noindex, nofollow` + `X-Robots-Tag` sur toutes les réponses Next ; pas de `Disallow: /` ; sitemap non déclaré |
| D22 | Nginx route `/` vers Next.js et conserve `/api` vers PHP-FPM | `/` ne renvoie plus `404` ; `X-Robots-Tag` de Nginx limité à `/api` |
| D23 | `API_INTERNAL_URL=http://nginx` pour les appels serveur | PHP-FPM n'est pas un serveur HTTP ; le trafic reste sur le réseau Docker |
| D24 | Administration en **fake auth** (`demo_session`) et **sans resource** | Aucune donnée réelle, aucun appel API métier ; le vrai auth arrive dans un change dédié |
| D25 | `next-sitemap` en postbuild avec `generateRobotsTxt: false` | Le `robots.txt` statique n'est jamais écrasé |

### 11.2 Points de vigilance
- Lighthouse SEO échouera sur « page bloquée pour l'indexation » : c'est attendu,
  ne pas retirer le noindex pour améliorer le score.
- Le cookie `demo_session` est un drapeau de démonstration lisible par
  JavaScript, pas un token : il ne doit jamais contenir d'identité ni de secret.
- Le sitemap n'est pas soumis à Search Console ni à Bing Webmaster Tools.
- `next-sitemap@4.2.3` est ancien : audit CVE et test de compatibilité avec
  Next 16 obligatoires, avec repli sur un script Node minimal si nécessaire.

### 11.3 Documentation mise à jour
- `docs/seo.md` : stratégie, deux couches de noindex, `robots.txt`, sitemap.
- `docs/adr/0003-noindex-permanent.md` : décision et alternatives.
- `docs/architecture.md` : service web, proxy, variables, commandes.
