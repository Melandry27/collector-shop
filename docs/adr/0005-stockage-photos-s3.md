# ADR-0005 : Stockage des photos d'articles dans S3 par URL pré-signée

- Statut : accepté
- Date : 2026-11-20

## Contexte

Un vendeur publie un article avec des photos (EF-05), et le contrôle automatique refuse un article sans photo (motif `MISSING_PHOTO`, voir [user-stories.md](../backlog/user-stories.md)). Il faut décider où sont stockés les fichiers et comment ils y arrivent.

Contraintes :

- les pods de l'application sont jetables et répliqués : un fichier stocké sur leur disque serait perdu ou invisible des autres répliques ;
- l'infrastructure du POC est détruite à chaque session du Learner Lab ([ADR-0004](0004-learner-lab.md)), sauf un socle conservé (state Terraform, ECR) ;
- un fichier envoyé par un utilisateur est une donnée non fiable (type falsifié, taille excessive, contenu malveillant) ;
- le parcours de publication est filmé pour la vidéo de rendu : l'envoi de photos doit être réel et visible.

## Décision

Les photos sont stockées dans un **bucket S3 privé**, et le navigateur les envoie **directement dans S3** avec une **URL pré-signée** délivrée par `catalog-service`.

1. Le vendeur authentifié demande une URL d'envoi en indiquant le type et la taille du fichier (`POST /photo-uploads`).
2. `catalog-service` vérifie le rôle vendeur, le type (JPEG, PNG ou WebP) et la taille (5 Mo au plus), génère lui-même la clé de l'objet (`photos/<identifiant du vendeur>/<UUID>`) et renvoie une URL `PUT` valable quelques minutes, signée pour ce type de contenu et cette taille.
3. Le navigateur envoie le fichier sur cette URL ; il ne transite ni par l'ALB ni par les pods.
4. À la soumission de l'article (1 à 5 photos), le contrôle automatique vérifie que chaque objet existe et respecte les règles (`HeadObject`) ; sinon le motif `MISSING_PHOTO` s'applique.
5. L'affichage utilise des URL `GET` pré-signées de courte durée ; le bucket n'est jamais public.

Configuration du bucket : blocage de tout accès public, chiffrement SSE-S3, CORS limité à l'origine de l'application et aux méthodes `PUT` et `GET`, règle de cycle de vie qui supprime les objets jamais rattachés à un article. Le bucket fait partie du **socle Terraform conservé entre les sessions**, pour que les photos de démonstration survivent au `terraform destroy` de l'environnement.

## Alternatives étudiées

| Alternative | Avantages | Raison de l'écart |
|---|---|---|
| **URL d'une image déjà en ligne** saisie par le vendeur | Aucun stockage à opérer | Pas réaliste pour une place de marché, contenu hors de contrôle (image modifiée ou supprimée après le contrôle), parcours moins démonstratif |
| **Envoi via l'API** (`multipart/form-data` vers `catalog-service`, qui écrit dans S3) | Contrôle du contenu possible avant stockage | Les fichiers chargent les pods et l'ALB (bande passante, mémoire, délai) ; la montée en charge de l'API dépend de la taille des photos |
| **Stockage en base** (PostgreSQL, colonne binaire) | Une seule source de données | Base gonflée, sauvegardes et requêtes ralenties, coût RDS plus élevé que S3 |
| **Volume Kubernetes** (EBS) | Simple à monter | Volume attaché à un seul nœud et à une seule zone : incompatible avec plusieurs répliques ; détruit avec l'environnement |

## Conséquences

### Sécurité

- Seuls les vendeurs authentifiés obtiennent une URL d'envoi ; une URL ne vaut que pour un objet, un type et une taille, pendant quelques minutes.
- Le type est celui **déclaré** par le navigateur et imposé par la signature : le contenu réel du fichier n'est pas analysé dans le POC. L'analyse antivirus, la vérification du contenu réel et la suppression des métadonnées EXIF (qui peuvent contenir une position GPS) sont inscrites au plan de remédiation.
- Dans le Learner Lab, `catalog-service` accède à S3 avec les droits de `LabRole` hérités du nœud, bien plus larges que nécessaire. Cible : un rôle IAM dédié limité à ce bucket (Pod Identity ou IRSA).

### Fonctionnement

- Développement local et tests d'intégration : S3 est simulé par MinIO (docker compose) ou LocalStack (Testcontainers) ; le client S3 accepte un point de terminaison configurable.
- Le CORS du bucket dépend de l'origine de l'application, qui change avec le nom DNS de l'ALB à chaque session tant qu'il n'y a pas de nom de domaine : l'origine autorisée est une variable Terraform.
- Coût : quelques centimes par mois pour les photos de démonstration.
