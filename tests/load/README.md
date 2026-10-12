# Tests de charge k6

Scénarios prévus (S4-01) :

- `catalog-read.js` : lecture anonyme du catalogue, paliers de charge.
- `publish-article.js` : publication authentifiée (token Keycloak).

Seuils : p95 du temps de réponse et taux d'erreur, alignés sur les indicateurs qualité (docs/process).

```bash
k6 run -e BASE_URL=https://<domaine> tests/load/catalog-read.js
```
