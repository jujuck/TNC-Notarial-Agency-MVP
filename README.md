# TNC-Notarial-Agency-MVP
Projet MVP d'un site vitrine d'agence notariale / Test technique

## Le contexte

Notre activité repose sur plusieurs partenariats, dans des secteurs variés. Parmi eux, nous accompagnons notamment un certain nombre d'études notariales dans la conception et la refonte de leurs sites internet. C'est ce cas de figure que nous vous proposons de travailler.

## L'étude de cas

Concevez le site internet d'une étude notariale fictive.

La consigne est volontairement ouverte : réalisez le meilleur site possible, tel que vous l'imaginez, en vous inspirant librement de ce qui se fait déjà dans la profession (présentation, identité visuelle, logo, rubriques, prise de rendez-vous, etc.). Vous avez carte blanche sur le contenu, la structure et le design.

## Deux points, et deux seulement, sont à respecter :

- Tout doit être inventé : nom de l'étude, noms des notaires, adresse, coordonnées… Il s'agit d'une simulation, aucune donnée réelle ne doit apparaître.
- Aucune photo générée par intelligence artificielle : nous attachons de l'importance à l'authenticité et à la crédibilité du rendu.

Une fois le site terminé, il vous suffira de nous transmettre le lien par retour de mail.

## Le délai

Aucun délai imposé. Par respect pour les candidats actuellement en poste, qui ne disposent pas tous du même temps libre, nous préférons vous laisser avancer à votre rythme. Prenez le temps qu'il faut pour nous rendre un travail dont vous serez fier.

## Lancer le projet en local (développement)

### Prérequis

- Docker Engine avec le plugin Compose v2 (`docker compose version`)
- GNU Make
- Aucun PHP, Node.js ou MySQL à installer sur le poste : tout tourne dans Docker

### Démarrage

```bash
cp -n .env.example .env   # puis remplir les valeurs
make up
```

- Site : <http://localhost:8080>
- API : préfixe <http://localhost:8080/api/v1> (santé : `/api/v1/health`)
- MySQL : `127.0.0.1:3307` avec les identifiants du `.env`

`make up` exécute `docker compose up -d`. Sans option `-f`, Docker Compose charge
automatiquement `compose.yaml` **puis** `compose.override.yaml` : la stack démarre
donc en mode développement.

- Next.js tourne avec `next dev` (Turbopack, HMR) et le dossier `web/` est monté.
- L'API utilise la cible `dev`, avec `APP_ENV=development`, `APP_DEBUG=true` et
  les sources `api/` montées.
- MySQL n'est publié que sur `127.0.0.1:3307`.

Le port `80` affiché par `docker compose ps` (`0.0.0.0:8080->80/tcp`) est le port
interne du conteneur Nginx. Seul `8080` est exposé sur la machine (`HTTP_PORT`
dans le `.env`).

### Commandes utiles

| Commande | Rôle |
| --- | --- |
| `make logs` | suivre les logs de tous les services |
| `make sh` / `make web-sh` | shell dans les conteneurs API / web |
| `make smoke` | smoke test HTTP de l'API et du site |
| `make test`, `make stan`, `make cs` | qualité côté API |
| `make web-lint`, `make web-typecheck`, `make web-test` | qualité côté web |
| `make down` | arrêter la stack sans supprimer les volumes |

Après une modification d'un Dockerfile, de `package.json` ou de `composer.json`,
forcer la reconstruction de l'image :

```bash
make build
make up

# équivalent
docker compose up -d --build
```

`make up` seul ne reconstruit pas une image existante.

### Développement ou production ?

| | Développement | Production |
| --- | --- | --- |
| Commande | `make up` | `docker compose -f compose.yaml -f compose.prod.yaml up -d --build` |
| Image web | cible `dev`, `next dev` | cible `runtime`, build `standalone` |
| Sources | montées depuis le dépôt | copiées dans l'image |
| MySQL | publié sur `127.0.0.1:3307` | non publié |

La configuration de production n'est utilisée que si l'on passe explicitement
`-f compose.yaml -f compose.prod.yaml`. Dans ce cas, `compose.override.yaml`
n'est **pas** appliqué.

Ne jamais committer le fichier `.env`. Le déploiement est décrit dans
`docs/architecture.md`.
