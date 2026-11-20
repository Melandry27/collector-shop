import 'reflect-metadata';
import { ClassConstructor, plainToInstance, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min, validateSync } from 'class-validator';

/**
 * Variables d'environnement communes aux services. Chaque service étend cette classe
 * avec ses propres variables et ses valeurs par défaut.
 */
export class BaseEnvironment {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  /** Préfixe des routes métier, aligné sur le chemin routé par l'ALB. */
  @IsString()
  @IsNotEmpty()
  API_PREFIX: string = 'api';

  /** Version déployée (SHA du commit de main, injecté au build de l'image). */
  @IsString()
  @IsNotEmpty()
  APP_VERSION: string = 'dev';
}

/**
 * Crée la fonction de validation passée à `ConfigModule.forRoot({ validate })`.
 * Une configuration invalide arrête le service au démarrage au lieu de le faire échouer plus tard.
 */
export function createEnvironmentValidator<T extends object>(
  environmentClass: ClassConstructor<T>,
): (config: Record<string, unknown>) => T {
  return (config) => {
    const environment = plainToInstance(environmentClass, config, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(environment, { skipMissingProperties: false });
    if (errors.length > 0) {
      const details = errors.map((error) => Object.values(error.constraints ?? {}).join(', '));
      throw new Error(`Configuration invalide : ${details.join(' ; ')}`);
    }
    return environment;
  };
}
