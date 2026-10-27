# infra

Infrastructure as Code de Collector.shop sur AWS.

| Dossier | Contenu | Carte Trello |
|---|---|---|
| `terraform/` | VPC, EKS, ECR, RDS PostgreSQL, Secrets Manager (cluster et nœuds avec le rôle existant `LabRole`) | S2-01 |
| `platform/` | Valeurs Helm des briques de plateforme installées dans le cluster | S2-02 à S2-05 |
| `helm/` | Charts Helm des services applicatifs | S3-07 |

Règle de coût : l'infrastructure est créée à la demande et détruite après chaque session (`terraform destroy`).

Contrainte AWS Academy Learner Lab : aucun rôle IAM ni fournisseur OIDC ne peut être créé. Le POC utilise donc `LabRole` (ADR-0004) ; OIDC GitHub → IAM et un rôle par service (Pod Identity ou IRSA) sont la cible sur un compte AWS complet, pas une réalisation du POC.
