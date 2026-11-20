import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './environment.js';

describe('validateEnvironment', () => {
  it('applique les valeurs par défaut', () => {
    const environment = validateEnvironment({});
    expect(environment.PORT).toBe(3000);
    expect(environment.API_PREFIX).toBe('api/catalog');
    expect(environment.RABBITMQ_EXCHANGE).toBe('collector.events');
  });

  it('convertit le port reçu sous forme de texte', () => {
    expect(validateEnvironment({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('refuse un port invalide', () => {
    expect(() => validateEnvironment({ PORT: '70000' })).toThrow('Configuration invalide');
  });

  it('refuse un préfixe vide', () => {
    expect(() => validateEnvironment({ API_PREFIX: '' })).toThrow('Configuration invalide');
  });
});
