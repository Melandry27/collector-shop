# infra

Infrastructure as Code de Collector.shop sur AWS.

| Dossier | Contenu | Carte Trello |
|---|---|---|
| `terraform/` | VPC, EKS, ECR, RDS PostgreSQL, Secrets Manager, rôles IAM (OIDC GitHub, Pod Identity) | S2-01 |
| `platform/` | Valeurs Helm des briques de plateforme installées dans le cluster | S2-02 à S2-05 |
| `helm/` | Charts Helm des services applicatifs | S3-07 |

Règle de coût : l'infrastructure est créée à la demande et détruite après chaque session (`terraform destroy`).
