/** Jeton d'injection du registre Prometheus de l'application. */
export const METRICS_REGISTRY = Symbol('METRICS_REGISTRY');

/** Jeton d'injection de l'histogramme de durée des requêtes HTTP. */
export const HTTP_REQUEST_DURATION = Symbol('HTTP_REQUEST_DURATION');
