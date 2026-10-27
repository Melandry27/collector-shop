# ADR-0004 : Hébergement du POC sur AWS Academy Learner Lab (us-east-1, LabRole)

- Statut : accepté
- Date : 2026-10-27

## Contexte

Le compte AWS disponible pour le projet est un compte **AWS Academy Learner Lab**, fourni par l'école. Il est mis à disposition à titre pédagogique, avec des restrictions qui s'imposent à l'architecture et à la sécurité du POC. L'[ADR-0002](0002-aws-au-lieu-d-azure.md) a fixé le choix d'AWS ; le présent ADR précise **dans quel cadre** AWS est utilisé et ce que ce cadre interdit.

Contraintes constatées :

| Contrainte | Conséquence pour le projet |
|---|---|
| Régions `us-east-1` et `us-west-2` uniquement | Toute l'infrastructure est en **us-east-1** |
| Pas de création d'utilisateurs, de rôles IAM ni de fournisseur OIDC | Le cluster EKS et le groupe de nœuds utilisent le rôle existant **LabRole** (`aws iam get-role --role-name LabRole`). Ni IRSA, ni EKS Pod Identity, ni OIDC GitHub → AWS : les pods héritent des droits du nœud |
| Identifiants temporaires (clé d'accès, secret, jeton de session) renouvelés à chaque session | `~/.aws/credentials` et les secrets GitHub (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`) sont mis à jour à chaque session |
| Sessions d'environ 4 h ; les instances EC2 sont arrêtées en fin de session | L'infrastructure est créée par Terraform en début de session et détruite en fin de session |
| Budget limité | Pas de NAT Gateway : nœuds en sous-réseaux publics, RDS en sous-réseaux privés. 2 nœuds `t3.medium`, RDS `db.t3.micro`, sans Multi-AZ |
| EC2 jusqu'à la taille large (32 vCPU au plus), RDS jusqu'à medium | Dimensionnement du POC en conséquence |
| Terraform | Ressources `aws_eks_cluster` et `aws_eks_node_group` avec `role_arn` = LabRole ; le module communautaire `terraform-aws-modules/eks` et `eksctl` sont exclus car ils créent des rôles. `authentication_mode = "API_AND_CONFIG_MAP"` et `bootstrap_cluster_creator_admin_permissions = true` |

## Décision

Héberger le POC sur le **Learner Lab**, en **us-east-1**, avec **LabRole** comme rôle du cluster, du groupe de nœuds et, par héritage, des pods. L'infrastructure est décrite en Terraform, créée à la demande et détruite à la fin de chaque session.

Les services AWS retenus restent ceux de l'ADR-0002 : EKS, ECR, RDS PostgreSQL, Secrets Manager (avec External Secrets Operator), AWS Load Balancer Controller et ACM (voir [ADR-0003](0003-ingress-alb.md)).

**Règle de documentation** : dans tous les documents, ce qui est fait dans le POC est distingué de la cible sur un compte AWS complet. OIDC, Pod Identity, IRSA et la NAT Gateway ne sont jamais présentés comme existants dans le POC.

## Alternatives étudiées

| Alternative | Avantages | Raison de l'écart |
|---|---|---|
| **Compte AWS personnel avec crédits** | Création libre de rôles IAM, OIDC GitHub → IAM, IRSA ou Pod Identity, toutes régions | Risque de dépassement de coût à la charge de l'étudiant ; disponibilité et montant des crédits à vérifier. Écarté pour le POC, mais c'est la **cible** décrite dans le plan de remédiation |
| **Kubernetes local** (Minikube, k3d) | Gratuit, pas de contrainte de session | Ne satisfait pas l'exigence d'environnement managé : un POC en local plafonne à 2/5 sur le critère C5 |
| **Azure payant** | Cohérence avec l'écosystème Microsoft | Déjà écarté dans l'ADR-0002 (coût non couvert) |
| **Module Terraform communautaire pour EKS** | Moins de code à écrire | Crée des rôles IAM, ce que le lab interdit |

## Conséquences

### Sécurité

- **Pas de rôle IAM par service** : un pod compromis dispose des droits de LabRole. Mesures compensatoires à évaluer en bac à sable : NetworkPolicy de sortie vers les métadonnées d'instance, pas de jeton de compte de service monté quand il est inutile.
- **Pas d'OIDC GitHub → IAM** : la CI utilise des identifiants temporaires stockés dans les secrets GitHub. Atténuation : durée de vie courte, secrets d'*environment*, déploiement limité à `main`.
- Nœuds en sous-réseaux publics, sans Multi-AZ pour la base, sans WAF.
- Ces écarts ne sont pas des oublis : ils sont **traités dans le plan de remédiation** (critère C8) comme la trajectoire vers une cible conforme (OIDC GitHub → IAM, un rôle par service, moindre privilège, NAT Gateway, Multi-AZ). Détail dans [devsecops.md](../process/devsecops.md).

### Coûts

- Budget du lab limité : l'infrastructure est détruite entre les sessions.
- Ordre de grandeur d'une session de 4 h aux tarifs publics en us-east-1 (à vérifier dans la console) : plan de contrôle EKS ≈ 0,40 $, deux `t3.medium` ≈ 0,33 $, RDS `db.t3.micro` ≈ 0,07 $, ALB ≈ 0,09 $, soit **environ 1 $ par session**, hors trafic et stockage.
- Un oubli de `terraform destroy` fait consommer du budget : il fait partie de la routine de fin de session.

### Routine de session

Début de session :

1. Démarrer le lab et copier les identifiants (clé d'accès, secret, jeton de session) dans `~/.aws/credentials`, jamais dans le dépôt.
2. Mettre à jour les trois secrets GitHub (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`).
3. Vérifier l'identité avec `aws sts get-caller-identity` et le rôle avec `aws iam get-role --role-name LabRole`.
4. Créer l'infrastructure avec Terraform (`terraform apply`, **décision et exécution par l'utilisateur**), puis récupérer le `kubeconfig` et installer les composants de plateforme.
5. Déployer les services (CI ou Helm).

Fin de session :

1. Conserver les preuves utiles (rapports k6, captures Grafana, résultats de tests, journaux).
2. Détruire l'infrastructure (`terraform destroy`, **décision et exécution par l'utilisateur**).
3. Vérifier dans la console qu'il ne reste ni cluster, ni base, ni équilibreur de charge.

### Autres impacts

- Le jeton de session expirant, les déploiements de la CI échouent si les secrets GitHub n'ont pas été renouvelés (voir [ci-cd.md](../process/ci-cd.md)).
- Les décisions d'architecture indépendantes du lab (Kubernetes, Keycloak, RabbitMQ, PostgreSQL) sont inchangées : la migration vers un compte complet ne modifie que la couche IAM et le réseau.
- Le cahier des charges (Google Doc) mentionne encore Azure ; c'est volontaire, l'ADR-0002 trace le changement.
