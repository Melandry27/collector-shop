/**
 * Contrats des événements échangés via RabbitMQ (exchange topic `collector.events`).
 * Toute modification incompatible impose une nouvelle version (champ `version`).
 */

export const EXCHANGE = 'collector.events';

export const RoutingKeys = {
  ArticlePublie: 'article.publie',
  ArticleRefuse: 'article.refuse',
  ArticlePrixModifie: 'article.prix_modifie',
} as const;

interface EventEnvelope<TType extends string, TPayload> {
  /** Identifiant unique de l'événement, utilisé pour l'idempotence côté consommateur. */
  eventId: string;
  type: TType;
  version: 1;
  occurredAt: string; // ISO 8601
  payload: TPayload;
}

export type ArticlePublieEvent = EventEnvelope<
  typeof RoutingKeys.ArticlePublie,
  {
    articleId: string;
    shopId: string;
    sellerId: string;
    categoryId: string;
    title: string;
    priceCents: number;
    currency: 'EUR';
  }
>;

export type ArticleRefuseEvent = EventEnvelope<
  typeof RoutingKeys.ArticleRefuse,
  {
    articleId: string;
    sellerId: string;
    reasons: string[];
  }
>;

export type ArticlePrixModifieEvent = EventEnvelope<
  typeof RoutingKeys.ArticlePrixModifie,
  {
    articleId: string;
    sellerId: string;
    oldPriceCents: number;
    newPriceCents: number;
    currency: 'EUR';
  }
>;

export type CollectorEvent = ArticlePublieEvent | ArticleRefuseEvent | ArticlePrixModifieEvent;
