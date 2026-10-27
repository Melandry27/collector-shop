# CLAUDE.md — Contexte du projet Collector.shop

> Fichier de contexte pour l'agent de développement. À placer à la racine du dépôt `collector-shop`.

## Le projet

Évaluation individuelle du bloc « Superviser et assurer le développement des applications logicielles » (MAALSI, CESI). L'étudiant joue le rôle de **Lead Developer** de Collector.shop, une start-up fictive : place de marché web d'objets de collection entre particuliers, avec une commission de 5 % par transaction.

Soutenance : début janvier 2027. Présentation de 20 min suivie de 15 min d'échange devant un jury **technique**, d'où l'exigence d'un vocabulaire précis.

Le travail demandé se fait en 3 phases :

1. **Processus qualité** : 4 indicateurs ISO 25010 reliés à la dette technique, cycle de vie DevSecOps (mesures de sécurité par étape), schéma CI/CD détaillé, politique de tests, cartographie des compétences et action de formation.
2. **POC** : exigences reformulées, backlog (user stories et critères d'acceptation), schéma d'architecture, protocole d'expérimentation en bac à sable, **une fonctionnalité métier**, pipeline CI/CD avec au moins 2 types de tests, sécurité (HTTPS, authentification et autorisation, scan de vulnérabilités), une brique d'observabilité, déploiement sur environnement managé, test de charge en démo.
3. **Remédiation** : analyse de sécurité à partir des tests et métriques, plan d'actions priorisé et justifié.

## Grille d'évaluation (chaque critère sur 5 ; A si moyenne ≥ 4,6)

| # | Critère | Exigence pour 5/5 |
|---|---|---|
| C1 | Protocole d'expérimentation | Technologies et interactions, environnement, étapes reproductibles, difficultés, résultats justifiant l'adoption ou le rejet |
| C2 | Qualité technique du POC | Découpage, communication interservices, sécurité, hébergement, orchestration validés et documentés |
| C3 | Fonctionnalité métier | Répond au besoin de la maîtrise d'ouvrage |
| C4 | Processus CI/CD | Schématisé, conforme, implémenté dans le POC |
| C5 | Environnement d'exécution | Environnement **managé**, disponibilité et montée en charge démontrées (un POC en local plafonne à 2/5) |
| C6 | Indicateurs qualité | Au moins 4 indicateurs mesurés, axes d'amélioration sur la dette technique |
| C7 | Processus de test | Formalisé (types, outils, parties prenantes), au moins 2 types appliqués au POC et qui passent |
| C8 | Remédiation sécurité | Plan priorisé sur les risques critiques, au moins 2 bonnes pratiques de sécurité dans le POC |
| C9 | Compétences | Compétences recensées, expertises à acquérir, formation détaillée (pas un simple intitulé) |
| C10 | Présentation | Schémas lisibles, démo préparée, discours structuré |

À noter : une expérimentation limitée à un appel REST entre front et back, à des tests unitaires locaux ou à l'usage d'un framework n'est **pas** acceptée pour C1.

## Contexte métier (résumé)

- Rôles : visiteur (catalogue sans compte), acheteur, vendeur (particulier, plusieurs boutiques possibles), admin (catégories, modération, suppression d'articles ou de vendeurs).
- Article : photos, description précise, prix, frais de port. Mis en vente uniquement **après un contrôle automatisé** autant que possible.
- Variation de prix : historisée, notifiée aux acheteurs intéressés et envoyée à un composant anti-fraude (interne ou acheté, non décidé : intégration découplée).
- Paiement par carte uniquement, via la plateforme. Le chat entre acheteur et vendeur doit bloquer l'échange d'e-mails et de numéros de téléphone.
- Notifications et recommandations selon les centres d'intérêt, i18n, accessibilité, publicités ciblées sur des sites partenaires, architecture évolutive (enchères, live, bot…).

**Fonctionnalité métier du POC (validée)** : un vendeur publie un article, un contrôle automatique l'accepte ou le refuse avec un motif, puis l'événement `article.publie` déclenche une notification aux acheteurs dont un centre d'intérêt correspond.

## Stack et architecture (décidées)

- Front : React + TypeScript (Vite), react-i18next, OIDC PKCE.
- Back : NestJS (Node 24, TypeScript) : `catalog-service` (catalogue et contrôle automatique) et `notification-service`.
- Données : PostgreSQL (Amazon RDS). Messagerie : RabbitMQ (exchange topic `collector.events`).
- Identité : Keycloak (rôles acheteur / vendeur / admin).
- Hébergement : **AWS Academy Learner Lab**, région **us-east-1** (voir la section « Contraintes du Learner Lab ») : EKS, ECR, RDS PostgreSQL, Secrets Manager + External Secrets Operator. Pour le HTTPS, AWS Load Balancer Controller + ACM, à valider en bac à sable ; repli possible sur cert-manager + Let's Encrypt. Ingress NGINX est écarté car en fin de vie depuis mars 2026. Voir `docs/adr/`.
- IaC : Terraform (state S3), Helm.
- CI/CD : GitHub Actions, SonarCloud, Trivy, gitleaks, Dependabot, CodeQL, OWASP ZAP. Accès CI → AWS : identifiants temporaires du Learner Lab stockés dans les secrets GitHub et renouvelés à chaque session (OIDC impossible dans le lab ; c'est la cible, présentée dans le plan de remédiation).
- Tests : Jest (unitaires), Supertest + Testcontainers (intégration et acceptation), k6 (charge), Playwright (bonus).
- Observabilité : Prometheus + Grafana (métriques `/metrics`).

L'hébergement devait d'abord être sur Azure ; il est passé sur AWS faute d'abonnement (ADR-0002). Le cahier des charges Google Doc mentionne encore Azure, c'est voulu.

## Contraintes du Learner Lab AWS (à respecter dans le code ET dans les documents)

| Contrainte | Conséquence |
|---|---|
| Régions us-east-1 et us-west-2 uniquement | Tout est en **us-east-1** |
| Pas de création d'utilisateurs, de rôles IAM ni de fournisseur OIDC | Le cluster EKS et le node group utilisent le rôle existant **LabRole** (`aws iam get-role --role-name LabRole`). Ni IRSA, ni EKS Pod Identity, ni OIDC GitHub → AWS : les pods héritent des droits du nœud (LabRole) |
| Identifiants temporaires (access key + secret + session token), renouvelés à chaque session | `~/.aws/credentials` et les secrets GitHub (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`) sont à mettre à jour à chaque session |
| Sessions d'environ 4 h ; les EC2 sont arrêtées en fin de session | Infrastructure créée par Terraform en début de session, `terraform destroy` en fin de session |
| Budget limité | Pas de NAT Gateway : nœuds en sous-réseaux publics, RDS en sous-réseaux privés. 2 nœuds t3.medium, RDS db.t3.micro, sans Multi-AZ |
| EC2 jusqu'à la taille large, 32 vCPU max ; RDS jusqu'à medium | Dimensionner en conséquence |
| Terraform | Utiliser `aws_eks_cluster` / `aws_eks_node_group` avec `role_arn` = LabRole, **pas** le module communautaire terraform-aws-modules/eks ni eksctl (ils créent des rôles). `authentication_mode = "API_AND_CONFIG_MAP"`, `bootstrap_cluster_creator_admin_permissions = true` |

Dans les documents (DevSecOps, CI/CD, architecture, remédiation), distinguer systématiquement **ce qui est fait dans le POC (Learner Lab)** et **la cible sur un vrai compte AWS** : OIDC GitHub → IAM, un rôle IAM par service (IRSA ou Pod Identity), moindre privilège, NAT Gateway, Multi-AZ. Ces écarts sont des arguments pour le plan de remédiation (critère C8), pas des oublis.

## Structure du dépôt
apps/web-app | apps/catalog-service | apps/notification-service
packages/contracts # types des événements RabbitMQ (article.publie, article.refuse, article.prix_modifie)
infra/terraform | infra/platform | infra/helm
docs/architecture | docs/adr | docs/process | docs/backlog | docs/experimentation | docs/remediation
tests/load | tests/e2e


## Règles de travail (obligatoires)

- **Langue** : documentation en français, code et identifiants en anglais.
- **Git** : jamais de commit direct sur `main`. Une branche par carte Trello (`feat/`, `fix/`, `infra/`, `ci/`, `docs/`, `test/` + `S<n>-<nn>-<slug>`), puis une PR fusionnée en squash.
- **Commits** : Conventional Commits, vérifiés par commitlint et husky. Scopes autorisés : `web-app, catalog, notification, contracts, infra, terraform, helm, ci, docs, tests, deps, repo`.
- **Secrets** : aucun secret dans le dépôt (`.env` est ignoré, les secrets AWS vont dans Secrets Manager, ceux de la CI dans GitHub Secrets).
- **Actions irréversibles ou payantes** : ne jamais lancer `terraform apply` ou `destroy`, supprimer des ressources AWS, forcer un push ou modifier les réglages GitHub sans accord explicite de l'utilisateur.
- **Qualité des documents** : chaque livrable doit viser explicitement les critères de la grille ci-dessus. Les schémas sont en Mermaid dans les fichiers Markdown. Pas de remplissage, des affirmations vérifiables.
- **Identifiants** : ne jamais créer de dossier `.aws` ni de fichier d'identifiants dans le dépôt ; ils restent dans `~/.aws/`.
- **Environnement** : WSL Ubuntu, Node via nvm (vérifier que `which node` pointe sur `~/.nvm`, pas sur `/mnt/c`). Si le chemin du projet contient des espaces, toujours le mettre entre guillemets.

## Suivi

- Kanban Trello « Cube 3 Indiv : Collector.shop », 35 cartes de S1-01 à S4-08. Au 27/10 :
  - Terminé : S1-01 (Learner Lab) et S1-02 (dépôt).
  - En cours : S1-03.
  - À faire : S1-04 à S1-09, puis S2 à S4.
- Journal de bord (Google Doc) tenu par l'utilisateur : décisions, problèmes rencontrés et solutions. Pense à signaler dans ton résumé final tout problème ou toute décision qui mérite d'y figurer.
- La date de fin est en cours de replanification.
