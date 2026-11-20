import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from './configure-app.js';

@Controller()
class RootController {
  @Get()
  root(): string {
    return 'métier';
  }
}

@Controller('health')
class HealthController {
  @Get()
  health(): string {
    return 'ok';
  }
}

describe('configureApp', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RootController, HealthController],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, { apiPrefix: 'api/test' });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('sert les routes métier sous le préfixe', async () => {
    await request(app.getHttpServer()).get('/api/test').expect(200, 'métier');
    await request(app.getHttpServer()).get('/').expect(404);
  });

  it('sert les sondes hors préfixe', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, 'ok');
  });

  it("n'annonce pas le framework dans les en-têtes", async () => {
    const res = await request(app.getHttpServer()).get('/api/test');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
