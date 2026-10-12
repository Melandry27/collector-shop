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

## Statut

Squelette à générer en S2-07 (`npx @nestjs/cli new`).
