import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRED_PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/require-permission.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission =
      this.reflector.getAllAndOverride<RequiredPermission>(
        REQUIRED_PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;

    const userId = currentUser?.sub || currentUser?.id;

    if (!userId) {
      throw new ForbiddenException('Utilisateur non authentifié.');
    }

    const user = await (this.prisma as any).users.findUnique({
      where: { id: userId },
      include: {
        roles: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Utilisateur inactif ou introuvable.');
    }

    const roleName = String(user.roles?.name || '').toLowerCase();

    if (
      roleName === 'super_admin' ||
      roleName === 'super-admin' ||
      roleName === 'superadmin'
    ) {
      return true;
    }

    const permissionCount = await (this.prisma as any).role_permissions.count({
      where: {
        role_id: user.role_id,
        permissions: {
          module: requiredPermission.module,
          action: requiredPermission.action,
        },
      },
    });

    if (permissionCount === 0) {
      throw new ForbiddenException(
        `Permission refusée : ${requiredPermission.module}.${requiredPermission.action}`,
      );
    }

    return true;
  }
}