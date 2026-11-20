# @collector/nest-common

Briques NestJS partagées par `catalog-service` et `notification-service`. Elles sont regroupées ici plutôt que copiées dans chaque service, pour éviter la duplication de code suivie par SonarCloud (indicateur IQ2).

## `configureApp(app, { apiPrefix })`

- Préfixe des routes métier (par exemple `api/catalog`) : l'ALB route par chemin sans réécrire l'URL, le service doit donc répondre sous ce préfixe.
- Routes techniques hors préfixe : `/health` (sondes Kubernetes) et `/metrics` (Prometheus).
- En-tête `X-Powered-By` désactivé, arrêt propre sur `SIGTERM`.

## `MetricsModule.forRoot({ serviceName })` (story technique ST-01, indicateur IQ4)

- `GET /metrics` : métriques au format Prometheus, avec le libellé `service` sur chaque série.
- Métriques par défaut de Node.js (processus, mémoire, boucle d'événements) via `prom-client`.
- `http_request_duration_seconds` : histogramme de durée des requêtes HTTP, libellés `method`, `route` (chemin déclaré, pas l'URL brute, pour borner la cardinalité) et `status_code`.

```ts
@Module({ imports: [MetricsModule.forRoot({ serviceName: 'catalog-service' })] })
export class AppModule {}
```
