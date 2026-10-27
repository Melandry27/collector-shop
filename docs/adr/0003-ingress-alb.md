# ADR-0003 : Exposition HTTPS via AWS Load Balancer Controller et ACM

- Statut : proposé (à confirmer par le bac à sable S2-02 ; repli : Gateway API + cert-manager + Let's Encrypt)
- Date : 2026-10-12
- Mise à jour : 2026-10-27 (contexte Learner Lab, critères de repli)

## Contexte

Le POC doit être exposé en HTTPS. Le contrôleur communautaire ingress-nginx est en fin de vie depuis mars 2026 (plus de correctifs de sécurité).

## Décision

Utiliser AWS Load Balancer Controller (Ingress de classe `alb`) avec un certificat ACM validé par DNS.

Cette décision reste **à confirmer en bac à sable** dans le Learner Lab ([ADR-0004](0004-learner-lab.md)), où le contrôleur s'exécute avec les droits de LabRole et non avec un rôle dédié. **Critères de bascule vers le repli** : le contrôleur ne parvient pas à créer l'ALB avec les droits de LabRole, ou le certificat ACM ne peut pas être émis (domaine non disponible, validation DNS impossible).

**Repli** : Gateway API (Envoy Gateway) exposée par un équilibreur réseau, TLS terminé dans le cluster avec cert-manager et Let's Encrypt (HTTP-01). Ce repli correspond à la deuxième alternative ci-dessous, retenue seulement si l'essai échoue.

## Alternatives étudiées

- ingress-nginx + cert-manager : écarté, projet en fin de vie.
- Gateway API (Envoy Gateway) + cert-manager : standard d'avenir, plus de composants à opérer.

## Conséquences

- TLS terminé sur l'ALB, certificat renouvelé automatiquement par ACM.
- Possibilité d'ajouter AWS WAF sur l'ALB (plan de remédiation).
- Dépendance à AWS pour la couche d'entrée.
- Un nom de domaine est nécessaire dans les deux variantes (validation DNS d'ACM, ou résolution du nom pour Let's Encrypt) : le nom DNS par défaut d'un ALB ne peut pas recevoir de certificat.
- Dans le Learner Lab, le contrôleur n'a pas de rôle IAM dédié (pas d'IRSA ni de Pod Identity) : il utilise les droits du nœud, écart consigné dans le plan de remédiation.
