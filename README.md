# Collector.shop

POC de la plateforme Collector.shop : vente d'objets de collection entre particuliers (commission de 5 % par transaction).

Projet réalisé dans le cadre du bloc « Superviser et assurer le développement des applications logicielles » (MAALSI), rôle Lead Developer.

![CI](https://github.com/Melandry27/collector-shop/actions/workflows/ci.yml/badge.svg)

## Fonctionnalité métier du POC

Un vendeur publie un article ; un contrôle automatique l'accepte ou le refuse ; à la publication, les acheteurs dont un centre d'intérêt correspond reçoivent une notification.

## Stack

| Couche | Choix |
|---|---|
| Front-end | React + TypeScript (Vite), react-i18next |
| Back-end | NestJS (Node.js 24, TypeScript) |
| Données | PostgreSQL (Amazon RDS) |
| Messagerie | RabbitMQ |
| Identité | Keycloak (OIDC, rôles acheteur / vendeur / admin) |
| Hébergement | AWS EKS, ECR, RDS, S3 (photos), Secrets Manager, ALB + ACM |
| IaC | Terraform, Helm |
| CI/CD | GitHub Actions, SonarCloud, Trivy, gitleaks, OWASP ZAP |
| Tests | Vitest, Supertest, Testcontainers, k6, Playwright (bonus) |
| Observabilité | Prometheus, Grafana |

## Structure du dépôt

```
collector-shop/
├── apps/
│   ├── web-app/               # React (Vite)
│   ├── catalog-service/       # NestJS : catalogue, contrôle automatique, événements
│   └── notification-service/  # NestJS : centres d'intérêt, notifications
├── packages/
│   ├── contracts/             # Types des événements RabbitMQ partagés
│   └── nest-common/           # Briques NestJS partagées : configuration HTTP, métriques Prometheus
├── infra/
│   ├── terraform/             # VPC, EKS, ECR, RDS, Secrets Manager, IAM
│   ├── platform/              # Valeurs Helm : ALB controller, Keycloak, RabbitMQ, monitoring
│   └── helm/                  # Charts des services applicatifs
├── tests/
│   ├── load/                  # k6
│   └── e2e/                   # Playwright (bonus)
├── docs/                      # Architecture, ADR, processus, backlog, protocole, remédiation
├── scripts/                   # Scripts utilitaires (protection de branche…)
├── .github/                   # CI, Dependabot, modèle de PR
└── docker-compose.yml         # PostgreSQL, RabbitMQ, Keycloak, stockage S3 (RustFS) en local
```

## Démarrage local

Prérequis : Node.js 24 (`nvm use`), Docker, Git.

```bash
npm install                 # installe les outils du dépôt et active les hooks Git (husky)
cp .env.example .env        # puis changer les mots de passe
npm run dev:infra           # PostgreSQL :5432, RabbitMQ :5672 / :15672, Keycloak :8080, S3 (RustFS) :9000 / :9001
npm run build               # compile contracts et nest-common, dont dépendent les services
```

Lancer les applications (un terminal chacune) :

| Application | Commande | URL |
|---|---|---|
| catalog-service | `npm run start:dev -w @collector/catalog-service` | http://localhost:3000/api/catalog |
| notification-service | `npm run start:dev -w @collector/notification-service` | http://localhost:3001/api/notifications |
| web-app | `npm run dev -w @collector/web-app` | http://localhost:5173 |

Sondes et métriques des services, hors préfixe : `/health` (readiness), `/health/live` (liveness), `/metrics` (Prometheus).

Vérifications avant une PR, à la racine : `npm run lint && npm test && npm run build && npm run typecheck` (le typage des tests suppose les paquets partagés compilés).

Images Docker (contexte = racine du dépôt) : `docker compose --profile apps up -d --build` construit et lance les 3 images (front sur http://localhost:8081).

## Conventions

Voir [CONTRIBUTING.md](CONTRIBUTING.md) : Conventional Commits, nommage des branches, pull requests, définition de fini.

## Documentation

Voir [docs/](docs/README.md). Les décisions d'architecture sont tracées dans [docs/adr](docs/adr).
