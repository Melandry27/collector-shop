import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

/**
 * Sondes Kubernetes (story technique ST-03).
 * - `/health/live` (liveness) : le processus répond ; aucune dépendance vérifiée.
 * - `/health` (readiness) : le service est prêt à recevoir du trafic ; les vérifications
 *   de PostgreSQL et de RabbitMQ y seront ajoutées avec ces dépendances (503 si l'une échoue).
 */
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('live')
  @HealthCheck()
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
