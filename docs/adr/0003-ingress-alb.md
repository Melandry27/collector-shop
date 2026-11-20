# ADR-0003 : Exposition HTTPS via AWS Load Balancer Controller et ACM

- Statut : accepté pour le contrôleur ; certificat auto-signé dans le POC, à confirmer par le bac à sable S2-02
- Date : 2026-10-12
- Mises à jour : 2026-10-27 (contexte Learner Lab, critères de repli) ; 2026-11-20 (pas de nom de domaine dans le POC)

## Contexte

Le POC doit être exposé en HTTPS. Le contrôleur communautaire ingress-nginx est en fin de vie depuis mars 2026 (plus de correctifs de sécurité).

Le 20/11/2026, il a été décidé de **ne pas acheter de nom de domaine** pour l'instant. Or ACM ne délivre un certificat validé que pour un domaine maîtrisé, et le nom DNS par défaut d'un ALB (`*.elb.amazonaws.com`) ne peut pas recevoir de certificat de confiance, ni par ACM ni par Let's Encrypt.

## Décision

Utiliser **AWS Load Balancer Controller** (Ingress de classe `alb`), avec **une seule ALB** partagée par tous les Ingress du POC (`alb.ingress.kubernetes.io/group.name`) et un routage par chemin.

Pour le certificat :

- **POC (sans domaine)** : certificat **auto-signé** généré par Terraform (provider `tls`) et **importé dans ACM** ; l'ALB l'utilise sur le port 443 et redirige le port 80 vers 443. Le trafic est chiffré, mais le navigateur affiche un avertissement que l'utilisateur accepte.
- **Cible** : nom de domaine maîtrisé et certificat ACM validé par DNS, renouvelé automatiquement.

Cette décision reste **à confirmer en bac à sable** dans le Learner Lab ([ADR-0004](0004-learner-lab.md)), où le contrôleur s'exécute avec les droits de LabRole et non avec un rôle dédié.

**Repli** si le HTTPS auto-signé échoue (import ACM refusé, contrôleur incapable de l'utiliser) : HTTP sur le nom DNS de l'ALB. Ce repli a une conséquence importante : la connexion OIDC avec PKCE utilise l'API Web Crypto du navigateur, réservée aux contextes sécurisés (HTTPS ou `localhost`). En HTTP, la connexion Keycloak depuis le front risque de ne pas fonctionner : c'est le premier point à vérifier en S2-02.

## Alternatives étudiées

- ingress-nginx + cert-manager : écarté, projet en fin de vie.
- Gateway API (Envoy Gateway) + cert-manager + Let's Encrypt : standard d'avenir, plus de composants à opérer, et nécessite lui aussi un nom de domaine.
- Nom de domaine dynamique gratuit (sslip.io, nip.io) + Let's Encrypt : le nom dépend de l'adresse IP, or celles d'un ALB changent ; limites de débit de Let's Encrypt sur ces domaines partagés. Écarté pour le POC.

## Conséquences

- TLS terminé sur l'ALB ; possibilité d'ajouter AWS WAF sur l'ALB (plan de remédiation).
- Dépendance à AWS pour la couche d'entrée.
- **Certificat sans confiance** dans le POC : avertissement du navigateur, et un utilisateur habitué à l'accepter devient vulnérable à une interception. Écart consigné dans le plan de remédiation (cible : domaine + ACM).
- La clé privée du certificat auto-signé est stockée dans le state Terraform (bucket S3 chiffré, accès LabRole) : acceptable pour un certificat de démonstration, à éviter en production.
- Le nom DNS de l'ALB change à chaque session : tout ce qui en dépend (URL de Keycloak, redirections OIDC, CORS du bucket des photos, configuration du front) est paramétrable.
- Dans le Learner Lab, le contrôleur n'a pas de rôle IAM dédié (pas d'IRSA ni de Pod Identity) : il utilise les droits du nœud, écart consigné dans le plan de remédiation.
