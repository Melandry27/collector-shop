# ADR-0001 : Monorepo avec workspaces npm

- Statut : accepté
- Date : 2026-10-12

## Contexte

Projet mené par une seule personne, en un mois, avec trois composants applicatifs (web-app, catalog-service, notification-service), des contrats d'événements partagés et l'infrastructure as code.

## Décision

Un seul dépôt Git organisé en `apps/`, `packages/`, `infra/`, `docs/`, `tests/`, avec les workspaces npm. Un pipeline CI unique.

## Alternatives étudiées

- Un dépôt par service (polyrepo) : isolation plus forte mais coût de coordination élevé (versions des contrats, plusieurs pipelines) pour une équipe d'une personne.
- Outil de build de monorepo (Nx, Turborepo) : utile à plus grande échelle, surcoût d'apprentissage non justifié pour le POC.

## Conséquences

- Contrats d'événements partagés sans publication de paquet.
- Une modification transverse tient dans une seule pull request.
- À terme, le pipeline devra ne construire que les composants modifiés (filtres de chemins).
