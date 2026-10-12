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

## Statut

Squelette à générer en S2-07 (`npx @nestjs/cli new`).
