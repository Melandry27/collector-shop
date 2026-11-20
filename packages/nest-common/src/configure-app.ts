import { INestApplication, RequestMethod } from '@nestjs/common';

export interface HttpOptions {
  /**
   * Préfixe des routes métier, par exemple `api/catalog`.
   * L'ALB route par chemin sans réécrire l'URL : le service doit donc répondre sous ce préfixe.
   */
  apiPrefix: string;
}

/** Routes techniques servies hors préfixe : sondes Kubernetes et collecte Prometheus. */
export const TECHNICAL_ROUTES = ['health', 'health/(.*)', 'metrics'];

/** Réglages HTTP communs aux services NestJS. */
export function configureApp(app: INestApplication, options: HttpOptions): void {
  app.setGlobalPrefix(options.apiPrefix, {
    exclude: TECHNICAL_ROUTES.map((path) => ({ path, method: RequestMethod.ALL })),
  });

  // Ne pas annoncer le framework utilisé (en-tête X-Powered-By d'Express).
  const httpAdapter = app.getHttpAdapter().getInstance() as { disable?: (setting: string) => void };
  httpAdapter.disable?.('x-powered-by');

  // Arrêt propre sur SIGTERM (Kubernetes) : fermeture des connexions avant la fin du pod.
  app.enableShutdownHooks();
}
