# notification-service

Service NestJS responsable des notifications.

## Responsabilités

- Centres d'intérêt et préférences de notification de l'acheteur.
- Consommation idempotente de l'événement `article.publie` et création des notifications pour les acheteurs concernés.
- Notifications in-app (API) ; envoi e-mail en option.

## Interfaces

| Type | Détail |
|---|---|
| REST (rôle acheteur) | `GET /notifications`, `PUT /interests` |
| Événements consommés | `article.publie` |
| Données | PostgreSQL (schéma `notification`) |
| Observabilité | `/health`, `/metrics` (Prometheus) |

## Exécution

| Commande | Rôle |
|---|---|
| `npm run start:dev` | Démarrage avec rechargement (port 3001) |
| `npm run build` puis `npm start` | Build (`dist/`) et démarrage compilé |
| `npm test` / `npm run test:cov` | Tests unitaires Vitest, avec couverture (lcov) |
| `npm run lint` | ESLint |

Image : `docker build -f apps/notification-service/Dockerfile --build-arg APP_VERSION=$(git rev-parse HEAD) .` depuis la racine (multi-étapes, utilisateur `node` non root, dépendances de production uniquement).

## Configuration

Variables d'environnement validées au démarrage (`src/config/environment.ts`) : une valeur invalide arrête le service.

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3001` | Port HTTP |
| `API_PREFIX` | `api/notifications` | Préfixe des routes métier, aligné sur le chemin routé par l'ALB (qui ne réécrit pas l'URL) |
| `APP_VERSION` | `dev` | Version déployée, renvoyée par `GET /api/notifications` (SHA du commit, injecté au build de l'image) |
| `RABBITMQ_EXCHANGE` | `collector.events` | Exchange des événements métier |

## Statut

Squelette (S2-07) : NestJS 12 (ESM), routes techniques `/health`, `/health/live`, `/metrics` et `GET /api/notifications` (nom et version du service). Les fonctions métier arrivent en S3.
