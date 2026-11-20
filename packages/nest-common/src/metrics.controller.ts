import { Controller, Get, Header, Inject, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Registry } from 'prom-client';
import { METRICS_REGISTRY } from './metrics.constants.js';

@Controller('metrics')
export class MetricsController {
  constructor(@Inject(METRICS_REGISTRY) private readonly registry: Registry) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async getMetrics(@Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', this.registry.contentType);
    res.send(await this.registry.metrics());
  }
}
