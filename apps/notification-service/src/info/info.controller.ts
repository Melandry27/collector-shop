import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/environment.js';

export interface ServiceInfo {
  service: string;
  version: string;
}

/** Racine de l'API : identifie le service et la version déployée (utile au smoke test). */
@Controller()
export class InfoController {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  @Get()
  info(): ServiceInfo {
    return { service: 'notification-service', version: this.config.get('APP_VERSION', { infer: true }) };
  }
}
