# Terraform (AWS)

Structure prévue :

```
terraform/
├── modules/            # modules internes si besoin (sinon modules terraform-aws-modules)
└── environments/
    └── dev/
        ├── backend.tf  # state distant S3 (verrouillage natif)
        ├── providers.tf
        ├── main.tf     # VPC, EKS, ECR, RDS, Secrets Manager, IAM
        ├── variables.tf
        └── outputs.tf
```

## Utilisation (à partir de S2-01)

```bash
cd infra/terraform/environments/dev
terraform init
terraform plan -out tfplan
terraform apply tfplan
aws eks update-kubeconfig --region eu-west-3 --name collector-dev
# fin de session
terraform destroy
```

Les fichiers `*.tfvars` et `*.tfstate` ne sont jamais versionnés.
