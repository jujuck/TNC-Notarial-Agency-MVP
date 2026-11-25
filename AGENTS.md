# Etude de Cas Technique : Agence notariale

## Stack

Next.js (frontend), PHP Slim (API REST/JSON), MySQL, Docker Compose.
Projet en phase de mise en place : la structure des dossiers et les commandes seront précisées après l'étape Architecture.
Déploiement VPS OVH

## Documentation (source de vérité : `docs/`)

Index : `docs/README.md`. Ne lire un document que lorsque la tâche le concerne.

| Sujet         | Fichier                               | À lire quand                            |
| ------------- | ------------------------------------- | --------------------------------------- |
| Cadrage       | `docs/annexe_journal_etude_de_cas.md` | Cadrage du projet lié à l'étude de cas  |
| Architecture  | `docs/architecture.md`                | structure, API, base de données, Docker |
| UX            | `docs/ux.md`                          | écrans, parcours, composants            |
| SEO           | `docs/seo.md`                         | pages publiques, métadonnées, rendu     |
| Accessibilité | `docs/accessibilite.md`               | composants UI, formulaires, contrastes  |

- La documentation est complétée au fil du projet : si un fichier n'existe pas
  encore, l'ignorer et ne pas inventer son contenu.
- Si une demande contredit la documentation, le signaler avant d'agir.
- Si une décision structurante est prise (architecture, UX, SEO, accessibilité),
  proposer la mise à jour du document concerné ; ne pas le modifier sans validation.

## Conventions

- Commits : Conventional Commits (commitlint actif).
- Branches : créées avec `make new-branch` (issue + draft PR).
- Ne jamais pousser sur la branche principale ni merger une PR.

## Workflow OpenSpec

- Toute nouvelle fonctionnalité passe par le skill `/openspec-propose` avant de coder.
- Specs dans `openspec/specs/`, changements dans `openspec/changes/`.
- Ne pas modifier `openspec/specs/` à la main : passer par un change, puis l'archiver.

## Sécurité

- Ne jamais lire, afficher ni committer les fichiers `.env`.
- Ne jamais lancer `docker compose down -v`, `docker volume rm` ni `docker system prune`.
- Requêtes SQL préparées (PDO), jamais de concaténation.
- Toujours vérifier les CVE avant ajout d'un bibliothèques tierces et la fiabilité de son éditeur
