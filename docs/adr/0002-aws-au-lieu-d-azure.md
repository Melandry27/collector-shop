# ADR-0002 : Hébergement sur AWS au lieu d'Azure

- Statut : accepté
- Date : 2026-10-08
- Mise à jour : 2026-10-27 (région us-east-1, voir [ADR-0004](0004-learner-lab.md))

## Contexte

L'hébergement était prévu sur Azure, cohérent avec l'écosystème Microsoft de Collector (Office 365, Exchange, Power BI). L'abonnement Azure for Students n'est plus disponible ; un compte AWS l'est.

## Décision

Héberger le POC sur AWS : EKS, ECR, RDS PostgreSQL, Secrets Manager, AWS Load Balancer Controller + ACM, région **us-east-1** (initialement eu-west-3, Paris, remplacée le 2026-10-27 : le compte fourni est un AWS Academy Learner Lab, limité à us-east-1 et us-west-2).

## Alternatives étudiées

- Rester sur Azure avec un abonnement payant : coût non couvert.
- Kubernetes local (Minikube, k3d) : ne satisfait pas l'exigence d'environnement managé.
- AWS ECS/Fargate au lieu d'EKS : plus simple, mais l'orchestration Kubernetes reste portable entre clouds et correspond à l'architecture cible.

## Conséquences

- L'architecture applicative reste inchangée (Kubernetes, Keycloak, RabbitMQ, PostgreSQL) : portabilité démontrée.
- Coût horaire du plan de contrôle EKS : infrastructure détruite entre les sessions.
- Le compte est un Learner Lab : rôles IAM et OIDC non créables, identifiants temporaires. Les contraintes et leurs conséquences sont dans l'[ADR-0004](0004-learner-lab.md).
- L'identité des collaborateurs (Entra ID / Office 365) pourra être fédérée à Keycloak ultérieurement.
