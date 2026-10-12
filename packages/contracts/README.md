# @collector/contracts

Types TypeScript des événements métier échangés sur RabbitMQ. Les services importent ces types pour garantir que producteur et consommateur parlent le même format.

| Clé de routage | Producteur | Consommateurs |
|---|---|---|
| `article.publie` | catalog-service | notification-service |
| `article.refuse` | catalog-service | (notification vendeur, à venir) |
| `article.prix_modifie` | catalog-service | notification-service, fraud-adapter (bonus) |
