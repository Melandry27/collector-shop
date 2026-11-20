# web-app

Front-end de Collector.shop : React + TypeScript (Vite), i18n avec react-i18next, authentification OIDC (Authorization Code + PKCE) auprès de Keycloak.

## Responsabilités (périmètre POC)

- Catalogue public (sans authentification).
- Formulaire de publication d'un article (rôle vendeur).
- Paramétrage des centres d'intérêt et liste des notifications (rôle acheteur).

## Exécution

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Vite (http://localhost:5173) ; `/api/catalog` et `/api/notifications` sont relayés vers les services locaux |
| `npm run build` | Vérification TypeScript puis build de production (`dist/`) |
| `npm test` / `npm run test:cov` | Tests Vitest + Testing Library, avec couverture (lcov) |
| `npm run lint` | ESLint (règles React Hooks) |

## Configuration d'exécution

Le front lit sa configuration dans `/config.js` au chargement (`src/config.ts`). Dans l'image, nginx génère ce fichier à partir des variables d'environnement du conteneur : changer d'URL ne demande pas de reconstruire l'image. Les valeurs par défaut sont **relatives**, car le front, les API et Keycloak sont servis par la même ALB, dont le nom DNS change à chaque session du Learner Lab.

| Variable | Défaut |
|---|---|
| `API_CATALOG_URL` | `/api/catalog` |
| `API_NOTIFICATIONS_URL` | `/api/notifications` |
| `KEYCLOAK_URL` | `/auth` |
| `KEYCLOAK_REALM` | `collector` |
| `KEYCLOAK_CLIENT_ID` | `web-app` |

Image : `docker build -f apps/web-app/Dockerfile .` depuis la racine. Servie par `nginx-unprivileged` (port 8080, non root), avec les en-têtes `X-Content-Type-Options`, `X-Frame-Options` et `Referrer-Policy`, et la sonde `/healthz`.

## Statut

Squelette (S2-07) : React 19, Vite, page d'accueil minimale. Les écrans arrivent en S3-05.
