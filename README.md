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
| Hébergement | AWS EKS, ECR, Secrets Manager, ALB + ACM |
| IaC | Terraform, Helm |
| CI/CD | GitHub Actions, SonarCloud, Trivy, gitleaks, OWASP ZAP |
| Tests | Jest, Supertest, Testcontainers, k6, Playwright (bonus) |
| Observabilité | Prometheus, Grafana |

## Structure du dépôt

```
collector-shop/
├── apps/
│   ├── web-app/               # React (Vite)
│   ├── catalog-service/       # NestJS : catalogue, contrôle automatique, événements
│   └── notification-service/  # NestJS : centres d'intérêt, notifications
├── packages/
│   └── contracts/             # Types des événements RabbitMQ partagés
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
└── docker-compose.yml         # PostgreSQL, RabbitMQ, Keycloak en local
```

## Démarrage local

Prérequis : Node.js 24 (`nvm use`), Docker, Git.

```bash
npm install                 # installe les outils du dépôt et active les hooks Git (husky)
cp .env.example .env        # puis changer les mots de passe
npm run dev:infra           # PostgreSQL :5432, RabbitMQ :5672 / :15672, Keycloak :8080
```

Les services applicatifs seront ajoutés en S2-07.

## Conventions

Voir [CONTRIBUTING.md](CONTRIBUTING.md) : Conventional Commits, nommage des branches, pull requests, définition de fini.

## Documentation

Voir [docs/](docs/README.md). Les décisions d'architecture sont tracées dans [docs/adr](docs/adr).
