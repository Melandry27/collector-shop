# Compétences et plan de formation

Carte S1-07. Critère visé : **C9** (compétences recensées, expertises à acquérir, formation détaillée).

> **Statut des niveaux.** Les niveaux ci-dessous sont des **estimations de travail** pour Collector.shop, société fictive : le lead dev correspond à l'étudiant, les autres profils sont des hypothèses réalistes. Les niveaux du lead dev sont à confirmer ou à ajuster par l'intéressé avant la soutenance.

## 1. Échelle de niveau

| Niveau | Intitulé | Signification |
|---|---|---|
| 1 | Notions | Connaît les concepts, a vu la technologie, ne l'utilise pas seul |
| 2 | Pratique encadrée | Réalise des tâches courantes avec un appui ou de la documentation, sans cas complexes |
| 3 | Autonome | Conçoit, réalise et dépanne seul en production |
| 4 | Référent | Définit les standards, forme les autres, traite les cas limites |

## 2. Profils

| Profil | Statut | Périmètre dans le projet |
|---|---|---|
| **Lead dev** | En poste (rôle de l'étudiant) | Architecture, qualité, pipeline, sécurité applicative, encadrement |
| **Dev confirmé A** | En poste, 5 ans d'expérience, orienté front et API | React / TypeScript, NestJS |
| **Dev confirmé B** | En poste, 5 ans d'expérience, orienté back et données | NestJS, PostgreSQL, messagerie |
| **DevOps / SRE AWS** | Recrutement envisagé | Plateforme, Terraform, EKS, observabilité, fiabilité |
| **QA automaticien** | Recrutement envisagé | Stratégie et automatisation des tests |

Aucun profil n'est supposé maîtriser l'ensemble : les dev confirmés sont solides sur le code applicatif mais n'ont jamais exploité Kubernetes en production ; le SRE ne connaît pas le domaine métier ni le front ; le QA n'administre pas l'infrastructure.

## 3. Matrice compétences × profils

Lecture : **niveau actuel → niveau cible** (cible à la fin du POC et de la première montée en charge). Une case vide signifie « hors périmètre du profil ». Les profils à recruter sont indiqués au niveau attendu à l'embauche (« actuel ») ; ils n'ont pas de niveau avant.

| Compétence | Lead dev | Dev A | Dev B | DevOps / SRE | QA auto. |
|---|---|---|---|---|---|
| React, TypeScript, Vite | 3 → 3 | 4 → 4 | 3 → 3 | 1 → 1 | 2 → 2 |
| NestJS, Node.js | 3 → 4 | 3 → 3 | 4 → 4 | 1 → 2 | 1 → 2 |
| PostgreSQL, modélisation, migrations | 3 → 3 | 2 → 3 | 4 → 4 | 3 → 3 | 2 → 2 |
| Messagerie asynchrone (RabbitMQ, idempotence) | 2 → 3 | 1 → 2 | 3 → 3 | 3 → 3 | 1 → 2 |
| Identité (OIDC, Keycloak) | 2 → 3 | 2 → 3 | 2 → 3 | 2 → 3 | 1 → 2 |
| Sécurité applicative (OWASP, STRIDE) | 2 → 3 | 2 → 3 | 2 → 3 | 3 → 3 | 2 → 3 |
| Docker, images durcies | 3 → 3 | 2 → 3 | 2 → 3 | 4 → 4 | 1 → 2 |
| Kubernetes, Helm | 2 → 3 | 1 → 2 | 1 → 2 | 4 → 4 | 1 → 2 |
| AWS (EKS, RDS, VPC, IAM) | 2 → 3 | 1 → 2 | 1 → 2 | 4 → 4 | 1 → 1 |
| Infrastructure as Code (Terraform) | 2 → 3 | 1 → 1 | 1 → 2 | 4 → 4 | 1 → 1 |
| CI/CD (GitHub Actions) | 3 → 3 | 2 → 3 | 2 → 3 | 4 → 4 | 3 → 3 |
| Tests unitaires et d'intégration (Jest, Testcontainers) | 3 → 4 | 3 → 3 | 3 → 3 | 2 → 2 | 4 → 4 |
| Tests de charge (k6) | 1 → 3 | 1 → 2 | 1 → 2 | 3 → 4 | 3 → 3 |
| Tests de bout en bout (Playwright) | 2 → 2 | 2 → 3 | 1 → 2 | 1 → 1 | 4 → 4 |
| Observabilité (Prometheus, Grafana) | 2 → 3 | 1 → 2 | 2 → 3 | 4 → 4 | 2 → 3 |
| Qualité et dette technique (SonarCloud) | 3 → 4 | 2 → 3 | 2 → 3 | 2 → 3 | 3 → 3 |
| Accessibilité et i18n | 2 → 2 | 3 → 3 | 1 → 2 | | 3 → 3 |
| Encadrement, revue de code | 3 → 4 | 3 → 3 | 3 → 3 | 3 → 3 | 2 → 3 |

## 4. Expertises à acquérir

Un écart est une compétence où l'équipe actuelle est sous le niveau 3 alors que le POC ou la cible en dépend. Classement par criticité pour la livraison.

| Priorité | Expertise | Écart de l'équipe actuelle | Impact si non traité | Réponse |
|---|---|---|---|---|
| 1 | **Kubernetes et EKS** (déploiement, sondes, ressources, politiques réseau, retour arrière) | Niveau 1 à 2 pour tous les développeurs | Le déploiement et la montée en charge (critère C5) reposent sur une seule personne ; incidents mal diagnostiqués | **Formation détaillée en section 5** ; embauche d'un SRE pour la cible |
| 2 | **Sécurité cloud et IAM** (rôles par service, Pod Identity / IRSA, OIDC GitHub → IAM) | Niveau 2 pour le lead dev, 1 pour les autres | Les écarts du Learner Lab ne peuvent pas être résorbés sur un vrai compte | Montée en compétence du lead dev (atelier IAM + documentation AWS), puis recrutement SRE |
| 3 | **Sécurité applicative (OWASP)** | Niveau 2 pour tous | Failles d'autorisation (401 / 403, contrôle de propriété) non détectées en revue | Formation courte OWASP Top 10 pour les développeurs (module 2 jours, voir tableau suivant) |
| 4 | **Tests de charge et performance** | Niveau 1 pour tous les développeurs | Les seuils de IQ4 ne sont ni calibrés ni interprétés correctement | Pratique guidée par le lead dev sur k6, puis appui du SRE |
| 5 | **Observabilité** | Niveau 1 à 2 | Alertes inutilisables, lecture incorrecte de Grafana | Atelier interne de 0,5 jour animé par le SRE |
| 6 | **Automatisation de tests de bout en bout** | Niveau 1 à 2 | Régressions d'interface non détectées | Recrutement du QA automaticien |

Autres actions, moins coûteuses :

| Expertise | Action | Format | Durée | Quand |
|---|---|---|---|---|
| Sécurité applicative | Formation OWASP Top 10 appliquée à NestJS et React | Atelier avec exercices sur une application volontairement vulnérable | 2 jours | Après la formation Kubernetes / EKS |
| Terraform | Parcours de certification de base ou tutoriel guidé | Autoformation encadrée | 2 jours | Pour le dev B |
| k6 | Écriture du premier scénario en binôme | Pair programming | 0,5 jour | Sprint 4 |
| Observabilité | Atelier Prometheus / Grafana | Interne | 0,5 jour | À l'arrivée du SRE |

## 5. Action de formation détaillée

### Intitulé

**Kubernetes et EKS pour développeurs**

### Contexte et justification

Le POC est déployé sur Amazon EKS ; chaque développeur doit pouvoir lire un manifeste, comprendre pourquoi un pod ne démarre pas, déployer et revenir en arrière. Les trois développeurs actuels sont au niveau 1 ou 2 sur Kubernetes et sur AWS (section 3) : c'est l'écart le plus pénalisant pour la livraison.

### Objectifs pédagogiques

À l'issue de la formation, le participant est capable de :

1. **expliquer** l'architecture d'un cluster Kubernetes (plan de contrôle, nœuds, pods, services) et d'EKS (plan de contrôle managé, groupes de nœuds, VPC CNI) ;
2. **écrire** les ressources d'une application NestJS : `Deployment`, `Service`, `Ingress`, `ConfigMap`, `Secret`, sondes de vivacité et de disponibilité, requêtes et limites de ressources ;
3. **empaqueter et déployer** une application avec Helm, et revenir à la version précédente en cas d'échec ;
4. **diagnostiquer** un incident courant (`CrashLoopBackOff`, `ImagePullBackOff`, sonde en échec, manque de mémoire) avec `kubectl describe`, `logs` et `events` ;
5. **appliquer** des mesures de sécurité de base : utilisateur non root, Pod Security Standards, NetworkPolicy de refus par défaut, gestion des secrets ;
6. **expliquer** la différence entre les droits d'un nœud et ceux d'un pod, et pourquoi Pod Identity / IRSA est la cible (lien avec le [plan de remédiation](../remediation/README.md)).

### Public

Lead dev et 2 développeurs confirmés. Groupe de 3 personnes, ce qui permet un accompagnement individuel pendant les travaux pratiques.

### Prérequis

- Docker : construire et lancer une image, notions de réseau de conteneurs.
- Ligne de commande Linux et Git.
- NestJS : savoir lancer une application et lire sa configuration.
- Aucun prérequis Kubernetes ni AWS.

### Format

Présentiel ou distanciel synchrone, **70 % de travaux pratiques**, 30 % d'exposés courts. Les exercices sont réalisés sur un environnement AWS bac à sable (Learner Lab ou équivalent) pour travailler sur le même type de cluster que le POC. Supports et dépôt d'exercices remis aux participants.

### Durée

**3 jours (21 heures)**, répartis sur deux semaines pour laisser le temps de pratiquer entre les sessions : 2 jours, puis 1 jour une semaine plus tard.

### Programme

| Jour | Matin | Après-midi |
|---|---|---|
| 1 | Concepts : conteneurs, pods, déploiements, services, `kubectl`. Cluster local de démonstration | TP : déployer `catalog-service` sur un cluster, exposer le service, lire les journaux |
| 2 | EKS : architecture, groupes de nœuds, VPC CNI, équilibreur de charge et certificat (AWS Load Balancer Controller, ACM) | TP : sondes, requêtes / limites, ConfigMap et Secret, mise à jour progressive et retour arrière |
| 3 | Helm : charts, valeurs, `--atomic` ; sécurité : utilisateur non root, Pod Security Standards, NetworkPolicy, External Secrets | TP de synthèse : déployer les deux services du POC avec Helm, provoquer puis diagnostiquer trois pannes imposées |

### Modalités d'évaluation

| Moment | Modalité | Critère de réussite |
|---|---|---|
| Début | Test de positionnement (10 questions) | Sert à adapter le rythme, non noté |
| Pendant | Contrôle des TP par le formateur | Chaque TP fonctionne et le participant sait expliquer ses manifestes |
| Fin | **Épreuve pratique** : déployer une application fournie avec Helm, corriger une sonde erronée, diagnostiquer une panne, effectuer un retour arrière | 4 tâches sur 4 réalisées en 2 heures, avec au plus un indice |
| Fin | QCM de 20 questions (architecture, sécurité) | ≥ 14 / 20 |
| 60 jours après | Application sur le projet : le participant a déployé au moins un changement via Helm et la CI sans aide | Relevé dans la matrice (niveau 3 attendu) |

### Coût indicatif

Ordres de grandeur à confirmer par devis ; ils ne reposent pas sur une offre précise.

| Poste | Hypothèse | Montant indicatif |
|---|---|---|
| Formateur externe (intra-entreprise) | 3 jours × 1 500 à 2 500 € | 4 500 à 7 500 € |
| Environnement bac à sable | Comptes de laboratoire, ou ressources AWS payantes pendant 3 jours | 0 à 150 € |
| Temps des participants | 3 personnes × 3 jours | 9 jours-homme |
| **Total hors temps des participants** | | **environ 4 500 à 7 700 €** |

Alternative moins coûteuse : parcours en autoformation encadrée par le lead dev (documentation officielle et exercices du Learner Lab), au prix d'un temps de préparation plus long et d'un niveau d'expertise moindre, puis relais par le SRE une fois recruté.

### Suivi après la formation

- Chaque participant prend en charge un petit changement de déploiement dans les deux semaines suivant la fin.
- Le niveau dans la matrice est révisé après 60 jours, avec un plan complémentaire si le niveau 3 n'est pas atteint.
- Le SRE recruté reprend le rôle de référent (niveau 4) et anime des revues de manifestes.

## 6. Recrutements envisagés

| Profil | Besoin | Compétences clés attendues | Écart couvert |
|---|---|---|---|
| **DevOps / SRE AWS** | Exploiter la plateforme, passer des droits hérités de LabRole à un rôle par service, fiabiliser le déploiement | Terraform, EKS, IAM (Pod Identity / IRSA, OIDC), Prometheus et Grafana, réponse à incident | Priorités 1, 2 et 5 |
| **QA automaticien** | Tenir la stratégie de test, automatiser le bout en bout, suivre les tests instables | Playwright, tests d'API, Gherkin, données de test, intégration CI | Priorité 6 |

Chaque recrutement est justifié par un écart mesuré dans la matrice, pas par une liste générique de compétences.
