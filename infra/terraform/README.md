# Terraform (AWS Academy Learner Lab, us-east-1)

Contraintes du Learner Lab : voir [ADR-0004](../../docs/adr/0004-learner-lab.md). Région **us-east-1**, rôle **LabRole** pour le cluster et les nœuds, aucune création de rôle IAM (pas de module `terraform-aws-modules/eks` ni d'eksctl).

Structure prévue (carte S2-01) :

```
terraform/
├── bootstrap/          # socle conservé entre les sessions, créé une seule fois
│                       #   bucket du state, dépôts ECR, bucket S3 des photos (ADR-0005)
├── modules/            # modules internes si besoin
└── environments/
    └── dev/            # créé en début de session, détruit en fin de session
        ├── backend.tf  # state distant S3 (verrouillage natif), voir backend.tf.example
        ├── providers.tf
        ├── main.tf     # VPC sans NAT, EKS + nœuds (LabRole), RDS, secrets, certificat auto-signé importé dans ACM
        ├── variables.tf
        └── outputs.tf
```

## Utilisation (à partir de S2-01)

`apply` et `destroy` sont des **actions manuelles** décidées par l'utilisateur.

```bash
# Une seule fois : le socle
cd infra/terraform/bootstrap
terraform init && terraform apply

# À chaque session
cd infra/terraform/environments/dev
terraform init
terraform plan -out tfplan
terraform apply tfplan
aws eks update-kubeconfig --region us-east-1 --name collector-dev

# Fin de session : supprimer d'abord les Ingress et les PVC (ALB et volumes EBS
# créés par les contrôleurs), sinon la suppression du VPC échoue
terraform destroy
```

Les fichiers `*.tfvars`, `*.tfstate` et `tfplan` ne sont jamais versionnés ; `.terraform.lock.hcl` l'est.
