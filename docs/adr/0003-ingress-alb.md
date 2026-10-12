# ADR-0003 : Exposition HTTPS via AWS Load Balancer Controller et ACM

- Statut : proposé (à confirmer par le bac à sable S2-02)
- Date : 2026-10-12

## Contexte

Le POC doit être exposé en HTTPS. Le contrôleur communautaire ingress-nginx est en fin de vie depuis mars 2026 (plus de correctifs de sécurité).

## Décision

Utiliser AWS Load Balancer Controller (Ingress de classe `alb`) avec un certificat ACM validé par DNS.

## Alternatives étudiées

- ingress-nginx + cert-manager : écarté, projet en fin de vie.
- Gateway API (Envoy Gateway) + cert-manager : standard d'avenir, plus de composants à opérer.

## Conséquences

- TLS terminé sur l'ALB, certificat renouvelé automatiquement par ACM.
- Possibilité d'ajouter AWS WAF sur l'ALB (plan de remédiation).
- Dépendance à AWS pour la couche d'entrée.
