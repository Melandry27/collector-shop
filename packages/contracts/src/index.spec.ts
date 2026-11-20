import { describe, expect, it } from 'vitest';
import { EXCHANGE, RoutingKeys } from './index.js';

// Les clés de routage sont un contrat entre services : un renommage casse les consommateurs.
describe('contrats des événements', () => {
  it("publie sur l'exchange collector.events", () => {
    expect(EXCHANGE).toBe('collector.events');
  });

  it('expose les clés de routage attendues par les consommateurs', () => {
    expect(RoutingKeys).toEqual({
      ArticlePublie: 'article.publie',
      ArticleRefuse: 'article.refuse',
      ArticlePrixModifie: 'article.prix_modifie',
    });
  });
});
