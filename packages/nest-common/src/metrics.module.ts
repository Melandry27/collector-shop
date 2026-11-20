import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { collectDefaultMetrics, Histogram, Registry } from 'prom-client';
import { HttpMetricsInterceptor } from './http-metrics.interceptor.js';
import { HTTP_REQUEST_DURATION, METRICS_REGISTRY } from './metrics.constants.js';
import { MetricsController } from './metrics.controller.js';

export interface MetricsModuleOptions {
  /** Nom du service, ajouté comme libellé `service` à toutes les séries. */
  serviceName: string;
}

@Module({})
export class MetricsModule {
  static forRoot(options: MetricsModuleOptions): DynamicModule {
    // Un registre par application (et non le registre global de prom-client),
    // pour que plusieurs instances de l'application dans un même processus de test ne se gênent pas.
    const registry = new Registry();
    registry.setDefaultLabels({ service: options.serviceName });
    collectDefaultMetrics({ register: registry });

    const httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Durée des requêtes HTTP en secondes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [registry],
    });

    return {
      module: MetricsModule,
      controllers: [MetricsController],
      providers: [
        { provide: METRICS_REGISTRY, useValue: registry },
        { provide: HTTP_REQUEST_DURATION, useValue: httpRequestDuration },
        { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
      ],
      exports: [METRICS_REGISTRY],
    };
  }
}
