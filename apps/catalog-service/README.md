# catalog-service

Service NestJS responsable du catalogue.

## Responsabilités

- Catégories (création réservée à l'admin), boutiques d'un vendeur, articles.
- Soumission d'un article, contrôle automatique (champs obligatoires, photos, coordonnées interdites, prix anormal), publication ou refus avec motif.
- Historique des prix.
- Publication des événements `article.publie` et `article.prix_modifie` sur RabbitMQ.

## Interfaces

| Type | Détail |
|---|---|
| REST (public) | `GET /articles`, `GET /articles/:id` |
| REST (rôle vendeur) | `POST /articles` |
| Événements émis | `article.publie`, `article.refuse`, `article.prix_modifie` |
| Données | PostgreSQL (schéma `catalog`) |
| Observabilité | `/health`, `/metrics` (Prometheus) |

## Exécution

| Commande | Rôle |
|---|---|
| `npm run start:dev` | Démarrage avec rechargement (port 3000) |
| `npm run build` puis `npm start` | Build (`dist/`) et démarrage compilé |
| `npm test` / `npm run test:cov` | Tests unitaires Vitest, avec couverture (lcov) |
| `npm run lint` | ESLint |

Image : `docker build -f apps/catalog-service/Dockerfile --build-arg APP_VERSION=$(git rev-parse HEAD) .` depuis la racine (multi-étapes, utilisateur `node` non root, dépendances de production uniquement).

## Configuration

Variables d'environnement validées au démarrage (`src/config/environment.ts`) : une valeur invalide arrête le service.

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3000` | Port HTTP |
| `API_PREFIX` | `api/catalog` | Préfixe des routes métier, aligné sur le chemin routé par l'ALB (qui ne réécrit pas l'URL) |
| `APP_VERSION` | `dev` | Version déployée, renvoyée par `GET /api/catalog` (SHA du commit, injecté au build de l'image) |
| `RABBITMQ_EXCHANGE` | `collector.events` | Exchange des événements métier |

## Statut

Squelette (S2-07) : NestJS 12 (ESM), routes techniques `/health`, `/health/live`, `/metrics` et `GET /api/catalog` (nom et version du service). Les fonctions métier arrivent en S3.
