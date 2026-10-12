# Briques de plateforme (Helm)

| Dossier | Chart | Rôle | Carte |
|---|---|---|---|
| `aws-load-balancer-controller/` | eks/aws-load-balancer-controller | Ingress → ALB, TLS ACM | S2-02 |
| `keycloak/` | Keycloak (opérateur ou chart) | Serveur d'autorisation OIDC | S2-03 |
| `rabbitmq/` | RabbitMQ (opérateur ou chart) | Bus d'événements | S2-04 |
| `monitoring/` | prometheus-community/kube-prometheus-stack | Métriques, Grafana | S2-05 |
| `external-secrets/` | external-secrets/external-secrets | Synchronisation Secrets Manager → Secrets Kubernetes | S3-07 |

Chaque dossier contient un `values.yaml` versionné (sans secret) et les étapes d'installation, réutilisées dans le protocole d'expérimentation.
