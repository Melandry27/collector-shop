import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Controller, Get, INestApplication, NotFoundException, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { MetricsModule } from './metrics.module.js';

@Controller('items')
class ItemsController {
  @Get(':id')
  findOne(@Param('id') id: string): { id: string } {
    if (id === 'absent') {
      throw new NotFoundException();
    }
    return { id };
  }
}

describe('MetricsModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MetricsModule.forRoot({ serviceName: 'test-service' })],
      controllers: [ItemsController],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('expose les métriques au format Prometheus avec le libellé du service', async () => {
    const res = await request(app.getHttpServer()).get('/metrics').expect(200);

    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('process_cpu_user_seconds_total');
    expect(res.text).toContain('service="test-service"');
  });

  it('mesure la durée des requêtes avec la route déclarée et non l’URL reçue', async () => {
    await request(app.getHttpServer()).get('/items/42').expect(200);

    const res = await request(app.getHttpServer()).get('/metrics');

    expect(res.text).toMatch(
      /http_request_duration_seconds_count\{[^}]*method="GET"[^}]*route="\/items\/:id"[^}]*status_code="200"[^}]*\} 1/,
    );
    expect(res.text).not.toContain('route="/items/42"');
  });

  it('enregistre le code de statut des requêtes en erreur', async () => {
    await request(app.getHttpServer()).get('/items/absent').expect(404);

    const res = await request(app.getHttpServer()).get('/metrics');

    expect(res.text).toMatch(/http_request_duration_seconds_count\{[^}]*status_code="404"[^}]*\} 1/);
  });
});
