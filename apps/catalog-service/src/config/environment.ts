import { EXCHANGE } from '@collector/contracts';
import { BaseEnvironment, createEnvironmentValidator } from '@collector/nest-common';
import { IsNotEmpty, IsString } from 'class-validator';

/** Variables d'environnement de catalog-service. */
export class EnvironmentVariables extends BaseEnvironment {
  override PORT: number = 3000;

  override API_PREFIX: string = 'api/catalog';

  /** Exchange RabbitMQ des événements métier (S2-04). */
  @IsString()
  @IsNotEmpty()
  RABBITMQ_EXCHANGE: string = EXCHANGE;
}

export const validateEnvironment = createEnvironmentValidator(EnvironmentVariables);
