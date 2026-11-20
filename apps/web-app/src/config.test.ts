import { describe, expect, it } from 'vitest';
import { defaultConfig, loadConfig } from './config';

describe('loadConfig', () => {
  it('utilise les valeurs par défaut sans configuration d’exécution', () => {
    expect(loadConfig(undefined)).toEqual(defaultConfig);
  });

  it('remplace les valeurs fournies et ignore les valeurs vides', () => {
    const config = loadConfig({ keycloakUrl: 'https://exemple.test/auth', keycloakRealm: '' });

    expect(config.keycloakUrl).toBe('https://exemple.test/auth');
    expect(config.keycloakRealm).toBe('collector');
  });
});
