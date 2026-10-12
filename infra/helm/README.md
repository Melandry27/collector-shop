# Charts Helm applicatifs

Un chart par service, créé en S3-07 :

- `charts/web-app`
- `charts/catalog-service`
- `charts/notification-service`

Chaque chart définit : Deployment (2 réplicas minimum, probes, requests/limits), Service, HorizontalPodAutoscaler, PodDisruptionBudget, ServiceMonitor (Prometheus) et, pour les services exposés, un Ingress de classe `alb`.
