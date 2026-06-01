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
        if (this.shouldSkip(method, path)) return;

        const action = this.getAction(method, path);
        const entityType = this.getEntityType(path);
        const entityId = request.params?.id || response?.id || response?.user?.id || null;
        const userId = user?.sub || user?.id || response?.user?.id || null;

        const actorLabel = this.getActorLabel(user, response);
        const entityLabel = this.getEntityLabel(response, request.body);
        const message = this.buildReadableMessage({
          actorLabel,
          action,
          entityType,
          entityId,
          entityLabel,
          failed: false,
        });

        await this.auditLogsService
          .create({
            userId,
            action,
            entityType,
            entityId,
            oldValue: null,
            newValue: {
              message,
              entityLabel,
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
        if (this.shouldSkip(method, path)) {
          return throwError(() => error);
        }

        const action = this.getAction(method, path);
        const entityType = this.getEntityType(path);
        const userId = user?.sub || user?.id || null;

        const actorLabel = this.getActorLabel(user, null);
        const message = this.buildReadableMessage({
          actorLabel,
          action,
          entityType,
          entityId: request.params?.id || null,
          entityLabel: null,
          failed: true,
        });

        this.auditLogsService
          .create({
            userId,
            action: `${action}_FAILED`,
            entityType,
            entityId: request.params?.id || null,
            oldValue: null,
            newValue: {
              message,
              method,
              path,
              params: request.params,
              query: request.query,
              body: this.sanitizeBody(request.body),
              status: 'FAILED',
              errorMessage: error?.message,
            },
            ipAddress: request.ip,
            userAgent: request.headers?.['user-agent'] || null,
          })
          .catch(() => undefined);

        return throwError(() => error);
      }),
    );
  }

  private shouldSkip(method: string, path: string) {
    const cleanPath = this.getCleanPath(path);

    if (
      cleanPath.includes('/health') ||
      cleanPath.includes('/favicon') ||
      cleanPath.startsWith('/audit-logs')
    ) {
      return true;
    }

    if (cleanPath.startsWith('/auth')) {
      return !(method === 'POST' && cleanPath === '/auth/login');
    }

    if (method === 'GET') {
      return true;
    }

    return false;
  }

  private getAction(method: string, path: string) {
    const cleanPath = this.getCleanPath(path);

    if (cleanPath === '/auth/login') return 'LOGIN';

    switch (method) {
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
    const cleanPath = this.getCleanPath(path);
    const parts = cleanPath.split('/').filter(Boolean);

    return parts[0] || 'unknown';
  }

  private getCleanPath(path: string) {
    return String(path || '').split('?')[0];
  }

  private getActorLabel(user: any, response: any) {
    const source = user || response?.user || null;

    if (!source) {
      return 'Système';
    }

    const firstName = source.firstName || source.first_name || '';
    const lastName = source.lastName || source.last_name || '';
    const fullName = this.normalizePersonName(firstName, lastName);

    return (
      fullName ||
      this.formatEmailAsName(source.email) ||
      source.id ||
      source.sub ||
      'Utilisateur'
    );
  }

  private normalizePersonName(firstName?: string | null, lastName?: string | null) {
    const cleanFirstName = String(firstName || '').trim();
    const cleanLastName = String(lastName || '').trim();

    const ignoredLastNames = new Set([
      'cropcontrole',
      'crop control',
      'agricontrol',
      'agri control',
    ]);

    const safeLastName = ignoredLastNames.has(cleanLastName.toLowerCase())
      ? ''
      : cleanLastName;

    return `${cleanFirstName} ${safeLastName}`.trim();
  }

  private formatEmailAsName(email?: string | null) {
    if (!email) return '';

    const localPart = String(email).split('@')[0] || '';

    return localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim();
  }

  private getEntityLabel(response: any, body: any) {
    const source = response || body || {};

    return (
      source.name ||
      source.full_name ||
      source.fullName ||
      source.legal_name ||
      source.legalName ||
      source.label ||
      source.title ||
      source.email ||
      source.code ||
      source.registration_number ||
      source.registrationNumber ||
      body?.name ||
      body?.full_name ||
      body?.fullName ||
      body?.legal_name ||
      body?.legalName ||
      body?.label ||
      body?.title ||
      body?.email ||
      body?.code ||
      body?.registration_number ||
      body?.registrationNumber ||
      null
    );
  }

  private buildReadableMessage(input: {
    actorLabel: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    entityLabel?: string | null;
    failed: boolean;
  }) {
    const actor = input.actorLabel || 'Utilisateur';

    if (input.failed) {
      if (input.action === 'LOGIN') {
        return `Tentative de connexion échouée pour ${actor}.`;
      }

      return `L’action ${this.getActionLabel(input.action).toLowerCase()} a échoué.`;
    }

    if (input.action === 'LOGIN') {
      return `L’utilisateur ${actor} s’est connecté.`;
    }

    const verb = this.getActionVerb(input.action);
    const entityTypeLabel = this.getEntityTypeLabel(input.entityType);
    const namePart = input.entityLabel ? ` “${input.entityLabel}”` : '';
    const idPart = input.entityId ? ` (ID : ${input.entityId})` : '';

    return `L’utilisateur ${actor} a ${verb} ${entityTypeLabel}${namePart}${idPart}.`;
  }

  private getActionVerb(action: string) {
    const value = String(action || '').toUpperCase();

    const labels: Record<string, string> = {
      CREATE: 'créé',
      UPDATE: 'modifié',
      DELETE: 'supprimé',
      LOGIN: 'connecté',
    };

    return labels[value] || value.toLowerCase();
  }

  private getActionLabel(action: string) {
    const value = String(action || '').toUpperCase();

    const labels: Record<string, string> = {
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression',
      LOGIN: 'Connexion',
    };

    return labels[value] || value;
  }

  private getEntityTypeLabel(entityType: string) {
    const value = String(entityType || '').toLowerCase();

    const labels: Record<string, string> = {
      auth: 'la session',
      groups: 'le groupe',
      companies: 'l’entreprise',
      farms: 'la ferme',
      plots: 'la parcelle',
      factories: 'l’usine',
      stations: 'la station',
      products: 'le produit',
      'product-varieties': 'la variété de produit',
      vehicles: 'le véhicule',
      personnel: 'le personnel',
      cultures: 'la culture',
      profiles: 'le profil',
      users: 'l’utilisateur',
      roles: 'le rôle',
      permissions: 'la permission',
      geography: 'la donnée géographique',
      'legal-identifier-types': 'le type d’identifiant légal',
    };

    return labels[value] || `l’élément ${value}`;
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