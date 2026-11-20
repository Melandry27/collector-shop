import { MetricsModule } from '@collector/nest-common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { validateEnvironment } from './config/environment.js';
import { HealthController } from './health/health.controller.js';
import { InfoController } from './info/info.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnvironment }),
    TerminusModule,
    MetricsModule.forRoot({ serviceName: 'catalog-service' }),
  ],
  controllers: [HealthController, InfoController],
})
export class AppModule {}
