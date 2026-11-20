import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Histogram } from 'prom-client';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { HTTP_REQUEST_DURATION } from './metrics.constants.js';

type DurationLabels = 'method' | 'route' | 'status_code';

/**
 * Mesure la durée de chaque requête HTTP traitée par un contrôleur.
 * Le libellé `route` est le chemin déclaré (`/articles/:id`) et non l'URL reçue,
 * pour que le nombre de séries reste borné.
 */
@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @Inject(HTTP_REQUEST_DURATION) private readonly histogram: Histogram<DurationLabels>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const route = (request.route as { path?: string } | undefined)?.path ?? 'unknown';
    const stopTimer = this.histogram.startTimer({ method: request.method, route });

    return next.handle().pipe(
      tap(() => stopTimer({ status_code: String(response.statusCode) })),
      catchError((error: unknown) => {
        const status = error instanceof HttpException ? error.getStatus() : 500;
        stopTimer({ status_code: String(status) });
        return throwError(() => error);
      }),
    );
  }
}
