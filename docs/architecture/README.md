# Architecture technique (première version)

Version de travail à affiner en S1-09.

```mermaid
flowchart LR
  user([Navigateur]) -->|HTTPS| alb[ALB<br/>TLS ACM]
  subgraph aws[AWS eu-west-3 - VPC]
    alb
    subgraph eks[Cluster EKS]
      web[web-app<br/>React]
      cat[catalog-service<br/>NestJS]
      notif[notification-service<br/>NestJS]
      kc[Keycloak<br/>OIDC]
      mq[(RabbitMQ)]
      mon[Prometheus + Grafana]
      eso[External Secrets]
    end
    rds[(RDS PostgreSQL)]
    sm[Secrets Manager]
    ecr[ECR]
  end
  alb --> web
  alb -->|/api/catalog| cat
  alb -->|/api/notifications| notif
  alb -->|/auth| kc
  web -. OIDC PKCE .-> kc
  cat -. vérif. JWT .-> kc
  notif -. vérif. JWT .-> kc
  cat -->|AMQP article.publie| mq
  mq -->|AMQP| notif
  cat --> rds
  notif --> rds
  kc --> rds
  eso --> sm
  mon -. scrape /metrics .-> cat
  mon -. scrape /metrics .-> notif
  ecr -. images .-> eks
```

## Flux de la fonctionnalité POC

1. Le vendeur, authentifié via Keycloak, soumet un article à `catalog-service`.
2. Le contrôle automatique accepte ou refuse l'article (motif enregistré).
3. Si l'article est publié, `catalog-service` émet `article.publie` sur RabbitMQ.
4. `notification-service` consomme l'événement et crée une notification pour chaque acheteur dont un centre d'intérêt correspond.

## Choix structurants

Voir `docs/adr/`.
