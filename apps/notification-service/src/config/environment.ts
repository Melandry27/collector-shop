import { EXCHANGE } from '@collector/contracts';
import { BaseEnvironment, createEnvironmentValidator } from '@collector/nest-common';
import { IsNotEmpty, IsString } from 'class-validator';

/** Variables d'environnement de notification-service. */
export class EnvironmentVariables extends BaseEnvironment {
  override PORT: number = 3001;

  override API_PREFIX: string = 'api/notifications';

  /** Exchange RabbitMQ des événements métier (S2-04). */
  @IsString()
  @IsNotEmpty()
  RABBITMQ_EXCHANGE: string = EXCHANGE;
}

export const validateEnvironment = createEnvironmentValidator(EnvironmentVariables);
