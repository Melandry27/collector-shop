# Conventions de travail

## Branches

- `main` : toujours déployable, protégée (pull request obligatoire, CI verte, historique linéaire).
- Une branche courte par carte Trello, fusionnée en squash :

| Préfixe | Usage | Exemple |
|---|---|---|
| `feat/` | Fonctionnalité | `feat/S3-02-publier-article` |
| `fix/` | Correction | `fix/S3-04-doublon-notification` |
| `infra/` | Terraform, Helm, plateforme | `infra/S2-01-terraform-eks` |
| `ci/` | Pipeline | `ci/S2-08-sonarcloud` |
| `docs/` | Documentation | `docs/S1-03-indicateurs` |
| `test/` | Tests | `test/S4-01-k6` |

## Messages de commit (Conventional Commits)

Format : `<type>(<scope>): <description>`, vérifié localement par un hook husky et dans la CI par commitlint.

- Types : `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`, `revert`, `style`.
- Scopes : `web-app`, `catalog`, `notification`, `contracts`, `infra`, `terraform`, `helm`, `ci`, `docs`, `tests`, `deps`, `repo`.

Exemples :

```
feat(catalog): ajouter la soumission d'un article
fix(notification): rendre la consommation de article.publie idempotente
build(terraform): créer le cluster EKS et le node group
ci: ajouter le scan Trivy des images
```

## Pull requests

- Titre au format Conventional Commits (il devient le message du squash).
- Remplir le modèle de PR, lier la carte Trello.
- La CI doit être verte avant la fusion.

## Définition de fini

Une carte passe en « Terminé » quand :

1. le code est fusionné dans `main` via une PR et la CI est verte ;
2. les tests correspondants existent et passent ;
3. aucun secret n'est versionné, aucune vulnérabilité critique n'est ouverte ;
4. la documentation (README, OpenAPI, docs/) est à jour ;
5. la checklist de la carte est cochée.

## Secrets

Aucun secret dans le dépôt : variables locales dans `.env` (ignoré par Git), secrets AWS dans Secrets Manager, secrets CI dans GitHub Actions. Authentification CI vers AWS : dans le POC (Learner Lab), identifiants temporaires stockés dans les secrets GitHub et renouvelés à chaque session ; cible production : OIDC GitHub → IAM, sans clé d'accès (voir `docs/process/devsecops.md`).
