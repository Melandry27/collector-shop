import { configureApp } from '@collector/nest-common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { EnvironmentVariables } from './config/environment.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  configureApp(app, { apiPrefix: config.get('API_PREFIX', { infer: true }) });
  await app.listen(config.get('PORT', { infer: true }), '0.0.0.0');
}

void bootstrap();
