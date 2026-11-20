/** Configuration d'exécution du front, lue au chargement de la page (`/config.js`). */
export interface AppConfig {
  apiCatalogUrl: string;
  apiNotificationsUrl: string;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

/**
 * Valeurs par défaut relatives : le front, les API et Keycloak sont servis par la même ALB.
 * Le nom DNS de l'ALB peut donc changer à chaque session sans reconstruire l'image.
 */
export const defaultConfig: AppConfig = {
  apiCatalogUrl: '/api/catalog',
  apiNotificationsUrl: '/api/notifications',
  keycloakUrl: '/auth',
  keycloakRealm: 'collector',
  keycloakClientId: 'web-app',
};

export function loadConfig(runtime: Partial<AppConfig> | undefined = window.__APP_CONFIG__): AppConfig {
  const defined = Object.fromEntries(
    Object.entries(runtime ?? {}).filter(([, value]) => typeof value === 'string' && value !== ''),
  );
  return { ...defaultConfig, ...defined };
}
