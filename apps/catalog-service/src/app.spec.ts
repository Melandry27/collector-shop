import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { configureApp } from '@collector/nest-common';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './app.module.js';

describe('catalog-service (application)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, { apiPrefix: 'api/catalog' });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('répond prêt sur la sonde de readiness, hors préfixe', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('répond sur la sonde de liveness', async () => {
    await request(app.getHttpServer()).get('/health/live').expect(200);
  });

  it('identifie le service et sa version à la racine du préfixe', async () => {
    const res = await request(app.getHttpServer()).get('/api/catalog').expect(200);
    expect(res.body).toEqual({ service: 'catalog-service', version: 'dev' });
  });

  it('expose les métriques Prometheus avec le nom du service', async () => {
    await request(app.getHttpServer()).get('/api/catalog');
    const res = await request(app.getHttpServer()).get('/metrics').expect(200);
    expect(res.text).toContain('service="catalog-service"');
    expect(res.text).toContain('http_request_duration_seconds_bucket');
  });
});
