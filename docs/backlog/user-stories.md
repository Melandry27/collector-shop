# Exigences et user stories du POC

Carte S1-08. Critère visé : **C3** (la fonctionnalité répond au besoin de la maîtrise d'ouvrage).

Fonctionnalité métier du POC (validée) : un vendeur publie un article ; un contrôle automatique l'accepte ou le refuse avec un motif ; l'événement `article.publie` déclenche une notification aux acheteurs dont un centre d'intérêt correspond.

## 1. Exigences fonctionnelles reformulées

Source : contexte métier de Collector.shop. **Hypothèse à confirmer avec le cahier des charges** : V1 = nécessaire au lancement de la place de marché ; V2 = évolution ultérieure. La colonne « POC » indique ce qui est réalisé dans le périmètre de l'évaluation.

| Réf. | Exigence reformulée | Version | POC | Stories |
|---|---|---|---|---|
| EF-01 | Un visiteur consulte le catalogue des articles en vente sans créer de compte. | V1 | Oui | US-05 |
| EF-02 | Un utilisateur s'authentifie avec un rôle : acheteur, vendeur ou administrateur. | V1 | Oui (vendeur et acheteur) | US-01, US-08 |
| EF-03 | Les accès aux fonctions sont contrôlés par rôle : l'absence d'identité est refusée (401), un rôle insuffisant est refusé (403). | V1 | Oui | US-08 |
| EF-04 | Un vendeur particulier peut gérer plusieurs boutiques. | V1 | Non : le modèle de données porte déjà `shopId` ; une boutique par défaut suffit au POC | |
| EF-05 | Un vendeur publie un article avec photos, description précise, prix et frais de port. | V1 | Oui, photos envoyées dans S3 | US-02 |
| EF-06 | Un article n'est mis en vente qu'après un contrôle automatisé autant que possible. | V1 | Oui | US-03, US-04b |
| EF-07 | Un article refusé par le contrôle l'est avec un motif lisible par le vendeur. | V1 | Oui | US-04 |
| EF-08 | Un acheteur déclare ses centres d'intérêt (catégories). | V1 | Oui | US-06 |
| EF-09 | Les acheteurs dont un centre d'intérêt correspond sont notifiés à la publication d'un article. | V1 | Oui | US-07 |
| EF-10 | L'administrateur gère les catégories, modère et supprime articles ou vendeurs. | V1 | Non | |
| EF-11 | Toute variation de prix est historisée. | V1 | Non (événement `article.prix_modifie` défini dans `packages/contracts`) | |
| EF-12 | Une variation de prix est notifiée aux acheteurs intéressés. | V1 | Non | |
| EF-13 | Une variation de prix est transmise à un composant anti-fraude, interne ou acheté, intégré de façon découplée. | V1 | Non | |
| EF-14 | Le paiement se fait par carte uniquement, via la plateforme, avec une commission de 5 % par transaction. | V1 | Non | |
| EF-15 | Le chat entre acheteur et vendeur bloque l'échange d'adresses e-mail et de numéros de téléphone. | V1 | Non (la même détection sert au contrôle des descriptions, US-04) | |
| EF-16 | La plateforme est disponible en plusieurs langues (i18n). | V1 | Oui, interface en français et en anglais | US-09 |
| EF-17 | L'interface respecte les règles d'accessibilité. | V1 | Oui, sur les écrans du POC | US-10 |
| EF-18 | Le vendeur voit le statut de ses articles et, en cas de refus, le motif. | V1 | Oui | US-04 |
| EF-19 | Les acheteurs reçoivent des recommandations selon leurs centres d'intérêt. | V2 | Non | |
| EF-20 | Des publicités ciblées sont diffusées sur des sites partenaires. | V2 | Non | |
| EF-21 | L'architecture permet d'ajouter enchères, ventes en direct et robot conversationnel. | V2 | Non (exigence d'architecture, voir [architecture](../architecture/README.md)) | |

## 2. Règles de gestion du contrôle automatique

Règles **validées le 20/11/2026** ; les seuils sont paramétrables dans le code.

### Refus automatique

| Code du motif | Condition de refus | Détail |
|---|---|---|
| `MISSING_PHOTO` | L'article n'a aucune photo, ou une photo référencée est absente du stockage | Au moins une photo est exigée. Le contrôle vérifie que chaque objet existe dans le bucket S3 et respecte le type et la taille autorisés (voir ci-dessous) |
| `CONTACT_INFO_IN_DESCRIPTION` | La description contient une adresse e-mail ou un numéro de téléphone | Détection par expressions régulières (formats e-mail ; numéros français et internationaux, avec ou sans séparateurs). Les contournements écrits en toutes lettres (« arobase », « zéro six… ») ne sont pas détectés dans le POC : limite documentée, traitée en V2 |
| `ABNORMAL_PRICE` | Le prix est inférieur ou égal à 0 €, ou supérieur à 10 000 € | Bornes incluses : 0,01 € et 10 000 € sont acceptés. Prix comparés en centimes |

Plusieurs motifs peuvent s'appliquer ensemble : l'événement `article.refuse` les liste tous dans `reasons`. Les centres d'intérêt correspondent aux **catégories** (`categoryId` de l'événement `article.publie`).

### Revue manuelle

| Code du motif | Condition | Effet |
|---|---|---|
| `PRICE_ABOVE_CATEGORY_MEDIAN` | Le prix est strictement supérieur à **10 fois la médiane** des prix des articles publiés de la même catégorie | L'article passe au statut `MANUAL_REVIEW` : il n'est ni publié ni refusé, et aucun événement n'est émis. La règle ne s'applique que si la catégorie compte au moins **5 articles publiés** (seuil paramétrable), sinon la médiane n'est pas significative |

La revue manuelle ne s'applique qu'à un article qui a passé les règles de refus. Dans le POC, l'écran de modération de l'administrateur n'est pas réalisé (EF-10) : l'article reste en `MANUAL_REVIEW` et le vendeur voit ce statut.

### Photos

| Règle | Valeur |
|---|---|
| Nombre | 1 à 5 photos par article |
| Types acceptés | JPEG, PNG, WebP (type déclaré à la demande d'URL et imposé par la signature) |
| Taille | 5 Mo au plus par photo |
| Mécanisme | Le navigateur demande à `catalog-service` une URL pré-signée par photo, puis envoie le fichier directement dans un bucket S3 privé ([ADR-0005](../adr/0005-stockage-photos-s3.md)) |

Une demande d'URL hors de ces règles est refusée par l'API (400) ; aucune URL n'est délivrée.

États d'un article :

```mermaid
stateDiagram-v2
  [*] --> PENDING_REVIEW: soumission par le vendeur
  PENDING_REVIEW --> PUBLISHED: contrôle accepté
  PENDING_REVIEW --> REFUSED: contrôle refusé avec motifs
  PENDING_REVIEW --> MANUAL_REVIEW: prix > 10 × médiane de la catégorie
  MANUAL_REVIEW --> PUBLISHED: validation par un administrateur (hors POC)
  MANUAL_REVIEW --> REFUSED: refus par un administrateur (hors POC)
  PUBLISHED --> [*]
  REFUSED --> PENDING_REVIEW: correction et nouvelle soumission
```

Flux nominal de la fonctionnalité :

```mermaid
sequenceDiagram
  actor V as Vendeur
  participant K as Keycloak
  participant C as catalog-service
  participant S as S3 (photos)
  participant Q as RabbitMQ
  participant N as notification-service
  actor A as Acheteur intéressé
  V->>K: S'authentifier (OIDC PKCE)
  K-->>V: Jeton d'accès (rôle vendeur)
  loop Pour chaque photo
    V->>C: Demander une URL d'envoi (type, taille)
    C-->>V: URL pré-signée
    V->>S: PUT de la photo
  end
  V->>C: POST article avec les références des photos (jeton)
  C->>S: Vérifier la présence des photos
  C->>C: Contrôle automatique
  alt Accepté
    C->>Q: article.publie
    Q->>N: article.publie
    N->>N: Chercher les acheteurs de cette catégorie
    N-->>A: Notification
  else Refusé
    C->>Q: article.refuse (motifs)
    C-->>V: Refus avec motifs
  else Prix > 10 × médiane de la catégorie
    C-->>V: Article en revue manuelle
  end
```

## 3. User stories

Priorités MoSCoW : **M** (Must : indispensable à la démonstration), **S** (Should), **C** (Could).

### US-01 : se connecter en tant que vendeur

**En tant que** vendeur, **je veux** m'authentifier avec mon compte, **afin de** publier des articles sous mon identité. Priorité : **M**. Exigences : EF-02.

```gherkin
Scénario: Connexion réussie d'un vendeur
  Étant donné un compte vendeur existant dans Keycloak
  Quand le vendeur s'authentifie avec ses identifiants via le flux OIDC avec PKCE
  Alors il obtient un jeton d'accès contenant le rôle "seller"
  Et l'interface affiche l'espace vendeur

Scénario: Identifiants invalides
  Étant donné un compte vendeur existant
  Quand le vendeur saisit un mot de passe incorrect
  Alors l'authentification échoue avec un message d'erreur générique
  Et aucun jeton n'est délivré

Scénario: Jeton expiré
  Étant donné un vendeur dont le jeton d'accès est expiré
  Quand il appelle l'API de publication
  Alors l'API répond 401
```

### US-02 : publier un article

**En tant que** vendeur, **je veux** soumettre un article avec photos, description, prix et frais de port, **afin de** le mettre en vente. Priorité : **M**. Exigences : EF-05, EF-06.

```gherkin
Scénario: Envoi d'une photo
  Étant donné un vendeur authentifié
  Quand il demande une URL d'envoi pour une photo JPEG de 2 Mo
  Alors l'API répond 201 avec une URL pré-signée valable quelques minutes
  Et l'envoi du fichier sur cette URL le stocke dans le bucket privé des photos

Scénario: Type de fichier refusé
  Étant donné un vendeur authentifié
  Quand il demande une URL d'envoi pour un fichier "application/pdf"
  Alors l'API répond 400
  Et aucune URL n'est délivrée

Scénario: Photo trop volumineuse
  Étant donné un vendeur authentifié
  Quand il demande une URL d'envoi pour une image de 6 Mo
  Alors l'API répond 400

Scénario: Trop de photos
  Étant donné un vendeur authentifié
  Quand il soumet un article qui référence 6 photos
  Alors l'API répond 400

Scénario: Soumission d'un article complet
  Étant donné un vendeur authentifié qui a envoyé une photo
  Quand il soumet un article avec un titre, une catégorie, une description, la référence de la photo, un prix et des frais de port
  Alors l'API répond 201
  Et l'article est enregistré au statut "PENDING_REVIEW" avec l'identifiant du vendeur

Scénario: Champs obligatoires manquants
  Étant donné un vendeur authentifié
  Quand il soumet un article sans titre ni catégorie
  Alors l'API répond 400
  Et la réponse liste les champs invalides
  Et aucun article n'est enregistré

Scénario: Prix ou frais de port négatif
  Étant donné un vendeur authentifié
  Quand il soumet un article avec des frais de port négatifs
  Alors l'API répond 400
```

### US-03 : le contrôle automatique accepte l'article

**En tant que** vendeur, **je veux** que mon article conforme soit mis en vente sans intervention manuelle, **afin de** le vendre rapidement. Priorité : **M**. Exigences : EF-06.

```gherkin
Scénario: Article conforme accepté
  Étant donné un article soumis avec au moins une photo, une description sans coordonnées et un prix de 45 €
  Quand le contrôle automatique s'exécute
  Alors l'article passe au statut "PUBLISHED"
  Et un événement "article.publie" est publié sur l'exchange "collector.events"
  Et l'événement contient l'identifiant de l'article, du vendeur, de la boutique, la catégorie, le titre et le prix en centimes

Scénario: Un échec de publication de l'événement n'est pas perdu
  Étant donné un article accepté
  Quand RabbitMQ est indisponible au moment de la publication de l'événement
  Alors l'événement est conservé pour une nouvelle tentative
  Et l'article reste au statut "PUBLISHED"
```

### US-04 : le contrôle automatique refuse l'article avec un motif

**En tant que** vendeur, **je veux** connaître la raison du refus de mon article, **afin de** le corriger et de le soumettre à nouveau. Priorité : **M**. Exigences : EF-06, EF-07, EF-15, EF-18.

```gherkin
Scénario: Photo manquante
  Étant donné un article soumis sans aucune photo
  Quand le contrôle automatique s'exécute
  Alors l'article passe au statut "REFUSED" avec le motif "MISSING_PHOTO"
  Et un événement "article.refuse" contenant ce motif est publié
  Et le vendeur voit le motif en consultant l'article

Scénario: Adresse e-mail dans la description
  Étant donné un article dont la description contient "contactez-moi sur jean.dupont@example.com"
  Quand le contrôle automatique s'exécute
  Alors l'article est refusé avec le motif "CONTACT_INFO_IN_DESCRIPTION"

Scénario: Numéro de téléphone dans la description
  Étant donné un article dont la description contient "appelez le 06 12 34 56 78"
  Quand le contrôle automatique s'exécute
  Alors l'article est refusé avec le motif "CONTACT_INFO_IN_DESCRIPTION"

Scénario: Photo référencée mais absente du stockage
  Étant donné un article qui référence une photo jamais envoyée dans S3
  Quand le contrôle automatique s'exécute
  Alors l'article est refusé avec le motif "MISSING_PHOTO"

Plan du Scénario: Bornes du prix
  Étant donné un article conforme par ailleurs au prix de <prix>
  Quand le contrôle automatique s'exécute
  Alors l'article passe au statut <statut>

  Exemples:
    | prix        | statut      |
    | 0 €         | "REFUSED" avec le motif "ABNORMAL_PRICE" |
    | 0,01 €      | "PUBLISHED" |
    | 10 000 €    | "PUBLISHED" |
    | 10 000,01 € | "REFUSED" avec le motif "ABNORMAL_PRICE" |

Scénario: Plusieurs motifs cumulés
  Étant donné un article sans photo et au prix de 0 €
  Quand le contrôle automatique s'exécute
  Alors l'événement "article.refuse" contient les motifs "MISSING_PHOTO" et "ABNORMAL_PRICE"

Scénario: Aucune notification pour un article refusé
  Étant donné un article refusé par le contrôle automatique
  Alors aucun événement "article.publie" n'est émis
  Et aucun acheteur ne reçoit de notification

Scénario: Resoumission après correction
  Étant donné un article refusé pour "MISSING_PHOTO"
  Quand le vendeur ajoute une photo et soumet à nouveau l'article
  Alors l'article repasse par le contrôle automatique
```

### US-04b : un prix inhabituel pour la catégorie déclenche une revue manuelle

**En tant que** responsable de la plateforme, **je veux** qu'un prix très supérieur aux prix habituels de la catégorie soit vérifié par une personne, **afin de** limiter les annonces frauduleuses ou les erreurs de saisie. Priorité : **S**. Exigences : EF-06.

```gherkin
Contexte:
  Étant donné la catégorie "Cartes" avec 5 articles publiés dont la médiane des prix est de 50 €

Scénario: Prix au-delà de 10 fois la médiane
  Quand un article conforme de la catégorie "Cartes" au prix de 500,01 € est contrôlé
  Alors l'article passe au statut "MANUAL_REVIEW" avec le motif "PRICE_ABOVE_CATEGORY_MEDIAN"
  Et aucun événement "article.publie" ni "article.refuse" n'est émis
  Et le vendeur voit le statut "en revue" en consultant l'article

Scénario: Prix égal à 10 fois la médiane
  Quand un article conforme de la catégorie "Cartes" au prix de 500 € est contrôlé
  Alors l'article passe au statut "PUBLISHED"

Scénario: Catégorie sans historique suffisant
  Étant donné la catégorie "Monnaies" avec 2 articles publiés
  Quand un article conforme de la catégorie "Monnaies" au prix de 9 000 € est contrôlé
  Alors la règle de la médiane ne s'applique pas
  Et l'article passe au statut "PUBLISHED"

Scénario: Un motif de refus l'emporte sur la revue manuelle
  Quand un article sans photo de la catégorie "Cartes" au prix de 900 € est contrôlé
  Alors l'article est refusé avec le motif "MISSING_PHOTO"
```

### US-05 : consulter le catalogue sans compte

**En tant que** visiteur, **je veux** parcourir les articles en vente sans m'inscrire, **afin de** découvrir la plateforme. Priorité : **M**. Exigences : EF-01.

```gherkin
Scénario: Liste publique des articles publiés
  Étant donné trois articles publiés et deux articles refusés
  Quand un visiteur sans jeton demande la liste du catalogue
  Alors l'API répond 200
  Et la réponse contient exactement les trois articles publiés
  Et elle ne contient aucune donnée personnelle du vendeur

Scénario: Filtrer par catégorie
  Étant donné des articles publiés dans les catégories "Monnaies" et "Cartes"
  Quand un visiteur filtre sur la catégorie "Cartes"
  Alors seuls les articles de la catégorie "Cartes" sont retournés

Scénario: Catalogue vide
  Étant donné qu'aucun article n'est publié
  Quand un visiteur demande la liste du catalogue
  Alors l'API répond 200 avec une liste vide

Scénario: Détail d'un article non publié
  Étant donné un article au statut "REFUSED"
  Quand un visiteur demande son détail
  Alors l'API répond 404
```

### US-06 : paramétrer ses centres d'intérêt

**En tant qu'** acheteur, **je veux** choisir les catégories qui m'intéressent, **afin d'** être prévenu des nouveaux articles correspondants. Priorité : **M**. Exigences : EF-08.

```gherkin
Scénario: Enregistrer ses centres d'intérêt
  Étant donné un acheteur authentifié
  Quand il sélectionne les catégories "Monnaies" et "Cartes"
  Alors l'API répond 200
  Et la relecture de ses préférences retourne ces deux catégories

Scénario: Catégorie inexistante
  Étant donné un acheteur authentifié
  Quand il sélectionne une catégorie qui n'existe pas
  Alors l'API répond 400

Scénario: Modifier ses centres d'intérêt
  Étant donné un acheteur intéressé par "Monnaies"
  Quand il remplace sa sélection par "Cartes"
  Alors il n'est plus notifié pour la catégorie "Monnaies"

Scénario: Préférences d'un autre acheteur
  Étant donné deux acheteurs authentifiés
  Quand le premier tente de lire les préférences du second
  Alors l'API répond 403
```

### US-07 : recevoir une notification à la publication d'un article correspondant

**En tant qu'** acheteur, **je veux** être notifié quand un article de ma catégorie est publié, **afin de** ne pas le manquer. Priorité : **M**. Exigences : EF-09.

```gherkin
Scénario: Notification d'un acheteur intéressé
  Étant donné un acheteur intéressé par la catégorie "Cartes"
  Quand un événement "article.publie" de la catégorie "Cartes" est reçu
  Alors une notification est créée pour cet acheteur
  Et elle référence l'article, son titre et son prix

Scénario: Aucun acheteur intéressé
  Étant donné aucun acheteur intéressé par la catégorie "Monnaies"
  Quand un événement "article.publie" de la catégorie "Monnaies" est reçu
  Alors aucune notification n'est créée
  Et l'événement est acquitté

Scénario: Acheteur intéressé par une autre catégorie
  Étant donné un acheteur intéressé uniquement par "Monnaies"
  Quand un événement "article.publie" de la catégorie "Cartes" est reçu
  Alors cet acheteur ne reçoit aucune notification

Scénario: Livraison en double du même événement
  Étant donné un événement "article.publie" déjà traité
  Quand le même événement (même "eventId") est reçu une seconde fois
  Alors aucune notification supplémentaire n'est créée

Scénario: Consultation de ses notifications
  Étant donné un acheteur notifié
  Quand il consulte ses notifications
  Alors il voit la notification, la plus récente en premier
  Et il ne voit jamais les notifications d'un autre acheteur

Scénario: Événement invalide
  Étant donné un message dont le contenu ne respecte pas le contrat "article.publie"
  Quand il est reçu par le service de notification
  Alors il est rejeté vers une file d'événements en échec
  Et aucune notification n'est créée
```

### US-08 : accès refusé en 401 ou 403 selon le rôle

**En tant que** responsable de la plateforme, **je veux** que chaque fonction soit réservée au bon rôle, **afin de** protéger les données et les actions sensibles. Priorité : **M**. Exigences : EF-02, EF-03.

```gherkin
Plan du Scénario: Matrice d'accès par rôle
  Étant donné un appelant avec le profil <profil>
  Quand il appelle <endpoint>
  Alors l'API répond <statut>

  Exemples:
    | profil                  | endpoint                              | statut |
    | aucun jeton             | POST /articles                        | 401    |
    | jeton expiré            | POST /articles                        | 401    |
    | jeton à signature falsifiée | POST /articles                    | 401    |
    | acheteur                | POST /articles                        | 403    |
    | vendeur                 | POST /articles                        | 201    |
    | acheteur                | POST /photo-uploads                   | 403    |
    | vendeur                 | POST /photo-uploads                   | 201    |
    | aucun jeton             | GET /articles                         | 200    |
    | vendeur                 | PUT /buyers/me/interests              | 403    |
    | acheteur                | PUT /buyers/me/interests              | 200    |
    | aucun jeton             | GET /notifications                    | 401    |
    | vendeur                 | DELETE /admin/articles/{id}           | 403    |

Scénario: Un vendeur ne modifie pas l'article d'un autre vendeur
  Étant donné deux vendeurs authentifiés
  Quand le vendeur B tente de modifier un article du vendeur A
  Alors l'API répond 403

Scénario: Réponses d'erreur sans fuite d'information
  Étant donné un appel refusé en 401 ou 403
  Alors la réponse ne contient ni trace d'appels ni détail technique
```

Les points d'entrée ci-dessus sont des noms de travail ; ils seront figés dans la spécification OpenAPI des services.

### US-09 : utiliser l'interface en français ou en anglais

**En tant qu'** utilisateur, **je veux** choisir ma langue, **afin de** comprendre l'interface. Priorité : **S**. Exigences : EF-16.

```gherkin
Scénario: Changement de langue
  Étant donné un utilisateur sur la page du catalogue en français
  Quand il choisit l'anglais
  Alors tous les libellés de l'interface s'affichent en anglais
  Et son choix est conservé à la visite suivante

Scénario: Motif de refus traduit
  Étant donné un article refusé avec le motif "MISSING_PHOTO"
  Quand le vendeur consulte l'article en anglais
  Alors le motif s'affiche en anglais
```

### US-10 : utiliser les écrans du POC au clavier

**En tant qu'** utilisateur de technologies d'assistance, **je veux** parcourir les écrans du POC au clavier avec des libellés explicites, **afin de** publier et consulter sans souris. Priorité : **C**. Exigences : EF-17.

```gherkin
Scénario: Formulaire de publication accessible
  Étant donné le formulaire de publication d'un article
  Quand l'utilisateur navigue uniquement au clavier
  Alors chaque champ est atteignable dans un ordre logique
  Et chaque champ a un libellé associé
  Et les erreurs de validation sont annoncées avec le champ concerné

Scénario: Contrôle automatisé d'accessibilité
  Étant donné les pages catalogue et publication
  Quand l'outil d'audit d'accessibilité s'exécute
  Alors il ne signale aucune violation de niveau critique
```

## 4. Stories techniques (nécessaires au POC)

Ce ne sont pas des fonctions métier, mais elles conditionnent des critères de la grille (C2, C5, C8).

| Réf. | Énoncé | Priorité | Critère d'acceptation | Critère de grille |
|---|---|---|---|---|
| ST-01 | En tant que lead dev, je veux que chaque service expose `/metrics`, afin d'observer le taux d'erreur et la latence. | M | `GET /metrics` retourne les métriques Prometheus, dont un histogramme de durée des requêtes HTTP ; Grafana les affiche | C2, C5 |
| ST-02 | En tant que lead dev, je veux que l'application soit servie en HTTPS, afin de protéger les échanges et les jetons. | M | Une requête HTTP est redirigée vers HTTPS. Dans le POC, sans nom de domaine, le certificat est auto-signé (avertissement du navigateur attendu) ; un certificat de confiance est la cible ([ADR-0003](../adr/0003-ingress-alb.md)) | C2, C8 |
| ST-03 | En tant que lead dev, je veux une sonde de santé par service, afin que Kubernetes détecte les pannes. | M | `GET /health` répond 200 si le service et ses dépendances sont prêts, sinon 503 | C5 |

## 5. Traçabilité

| Exigence | Story | Test d'acceptation (voir [politique de tests](../process/politique-de-tests.md)) |
|---|---|---|
| EF-01 | US-05 | `us-05-catalogue-public.acceptance.spec.ts` |
| EF-02, EF-03 | US-01, US-08 | `us-01-connexion-vendeur.acceptance.spec.ts`, `us-08-acces-par-role.acceptance.spec.ts` |
| EF-05, EF-06 | US-02, US-03 | `us-02-publier-article.acceptance.spec.ts`, `us-03-controle-accepte.acceptance.spec.ts` |
| EF-07, EF-15, EF-18 | US-04 | `us-04-controle-refuse.acceptance.spec.ts` |
| EF-06 | US-04b | `us-04b-revue-manuelle.acceptance.spec.ts` |
| EF-08 | US-06 | `us-06-centres-interet.acceptance.spec.ts` |
| EF-09 | US-07 | `us-07-notification.acceptance.spec.ts` |
| EF-16 | US-09 | Test de composant React (i18n) |
| EF-17 | US-10 | Audit d'accessibilité automatisé (bonus) |

## 6. Décisions

Prises le 20/11/2026 :

- **Prix** : refus si le prix est inférieur ou égal à 0 € ou supérieur à 10 000 € ; revue manuelle au-delà de 10 fois la médiane de la catégorie (section 2, US-04b).
- **Photos** : fichiers envoyés directement dans un bucket S3 privé par URL pré-signée, 1 à 5 photos JPEG, PNG ou WebP de 5 Mo au plus ([ADR-0005](../adr/0005-stockage-photos-s3.md)).

À valider :

- Signification de V1 et V2 (voir l'hypothèse en section 1).
- Format des notifications dans le POC : création d'une notification consultable dans l'application ; l'envoi par e-mail est exclu du POC.
- Seuil de 5 articles publiés pour appliquer la règle de la médiane.
