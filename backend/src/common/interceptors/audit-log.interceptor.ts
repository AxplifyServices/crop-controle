import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const method = request.method;
    const path = request.originalUrl || request.url;
    const user = request.user;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        if (this.shouldSkip(path)) return;

        const action = this.getAction(method, path);
        const entityType = this.getEntityType(path);
        const entityId = request.params?.id || response?.id || response?.user?.id || null;
        const userId = user?.sub || user?.id || response?.user?.id || null;

        await this.auditLogsService
          .create({
            userId,
            action,
            entityType,
            entityId,
            oldValue: null,
            newValue: {
              method,
              path,
              params: request.params,
              query: request.query,
              body: this.sanitizeBody(request.body),
              durationMs: Date.now() - startedAt,
              status: 'SUCCESS',
            },
            ipAddress: request.ip,
            userAgent: request.headers?.['user-agent'] || null,
          })
          .catch(() => undefined);
      }),
      catchError((error) => {
        if (this.shouldSkip(path)) {
          return throwError(() => error);
        }

        const action = this.getAction(method, path);
        const entityType = this.getEntityType(path);
        const userId = user?.sub || user?.id || null;

        this.auditLogsService
          .create({
            userId,
            action: `${action}_FAILED`,
            entityType,
            entityId: request.params?.id || null,
            oldValue: null,
            newValue: {
              method,
              path,
              params: request.params,
              query: request.query,
              body: this.sanitizeBody(request.body),
              status: 'FAILED',
              message: error?.message,
            },
            ipAddress: request.ip,
            userAgent: request.headers?.['user-agent'] || null,
          })
          .catch(() => undefined);

        return throwError(() => error);
      }),
    );
  }

  private shouldSkip(path: string) {
    return (
      path?.includes('/health') ||
      path?.includes('/favicon') ||
      path?.startsWith('/audit-logs')
    );
  }

  private getAction(method: string, path: string) {
    if (path.includes('/auth/login')) return 'LOGIN';
    if (path.includes('/auth/logout')) return 'LOGOUT';

    switch (method) {
      case 'GET':
        return 'VIEW';
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return method;
    }
  }

  private getEntityType(path: string) {
    const cleanPath = path.split('?')[0];
    const parts = cleanPath.split('/').filter(Boolean);

    return parts[0] || 'unknown';
  }

  private sanitizeBody(body: any) {
    if (!body) return body;

    const clone = { ...body };

    delete clone.password;
    delete clone.passwordHash;
    delete clone.password_hash;
    delete clone.accessToken;
    delete clone.refreshToken;
    delete clone.token;

    return clone;
  }
}