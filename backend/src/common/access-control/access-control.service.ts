import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type PermissionInput = {
  module: string;
  action: string;
};

type ScopeInput = {
  entityType: string;
  entityId: string;
};

@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserWithAccess(userId: string) {
    const user = await (this.prisma as any).users.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: {
                permissions: true,
              },
            },
          },
        },
        user_scopes: true,
      },
    });

    if (!user || user.deleted_at) {
      throw new ForbiddenException('Utilisateur introuvable ou supprimé.');
    }

    return user;
  }

  isSuperAdmin(user: any) {
    const roleName = String(user?.roles?.name || '').toLowerCase();

    return ['super_admin', 'super-admin', 'superadmin'].includes(roleName);
  }

  getPermissionKeys(user: any) {
    return new Set(
      user.roles?.role_permissions?.map((rolePermission: any) => {
        const permission = rolePermission.permissions;
        return `${permission.module}.${permission.action}`;
      }) || [],
    );
  }

  async assertCanGrantPermissions(creatorId: string, permissions: PermissionInput[]) {
    const creator = await this.getUserWithAccess(creatorId);

    if (this.isSuperAdmin(creator)) {
      return;
    }

    const creatorPermissions = this.getPermissionKeys(creator);

    for (const permission of permissions) {
      const exactKey = `${permission.module}.${permission.action}`;
      const adminKey = `${permission.module}.ADMIN`;

      if (!creatorPermissions.has(exactKey) && !creatorPermissions.has(adminKey)) {
        throw new ForbiddenException(
          `Vous ne pouvez pas accorder la permission ${exactKey}, car vous ne la possédez pas.`,
        );
      }
    }
  }

  async assertCanGrantScopes(creatorId: string, scopes: ScopeInput[]) {
    const creator = await this.getUserWithAccess(creatorId);

    if (this.isSuperAdmin(creator)) {
      return;
    }

    const creatorScopes = creator.user_scopes || [];

    for (const scope of scopes) {
      const allowed = await this.isScopeAllowedByCreatorScopes(creatorScopes, scope);

      if (!allowed) {
        throw new ForbiddenException(
          `Vous ne pouvez pas accorder le périmètre ${scope.entityType}:${scope.entityId}.`,
        );
      }
    }
  }

  private async isScopeAllowedByCreatorScopes(creatorScopes: any[], targetScope: ScopeInput) {
    const targetType = String(targetScope.entityType).toUpperCase();

    for (const creatorScope of creatorScopes) {
      const creatorType = String(creatorScope.entity_type).toUpperCase();
      const creatorId = creatorScope.entity_id;

      if (creatorType === targetType && creatorId === targetScope.entityId) {
        return true;
      }

      if (creatorType === 'GROUP') {
        if (targetType === 'COMPANY') {
          const company = await (this.prisma as any).companies.findFirst({
            where: { id: targetScope.entityId, group_id: creatorId },
          });

          if (company) return true;
        }

        if (targetType === 'FARM') {
          const farm = await (this.prisma as any).farms.findFirst({
            where: {
              id: targetScope.entityId,
              companies: {
                group_id: creatorId,
              },
            },
          });

          if (farm) return true;
        }

        if (targetType === 'FACTORY') {
          const factory = await (this.prisma as any).factories.findFirst({
            where: {
              id: targetScope.entityId,
              companies: {
                group_id: creatorId,
              },
            },
          });

          if (factory) return true;
        }

        if (targetType === 'STATION') {
          const station = await (this.prisma as any).stations.findFirst({
            where: {
              id: targetScope.entityId,
              factories: {
                companies: {
                  group_id: creatorId,
                },
              },
            },
          });

          if (station) return true;
        }
      }

      if (creatorType === 'COMPANY') {
        if (targetType === 'FARM') {
          const farm = await (this.prisma as any).farms.findFirst({
            where: { id: targetScope.entityId, company_id: creatorId },
          });

          if (farm) return true;
        }

        if (targetType === 'FACTORY') {
          const factory = await (this.prisma as any).factories.findFirst({
            where: { id: targetScope.entityId, company_id: creatorId },
          });

          if (factory) return true;
        }

        if (targetType === 'STATION') {
          const station = await (this.prisma as any).stations.findFirst({
            where: { id: targetScope.entityId, company_id: creatorId },
          });

          if (station) return true;
        }
      }

      if (creatorType === 'FACTORY' && targetType === 'STATION') {
        const station = await (this.prisma as any).stations.findFirst({
          where: { id: targetScope.entityId, factory_id: creatorId },
        });

        if (station) return true;
      }
    }

    return false;
  }

  async getDescendantUserIds(userId: string) {
    const descendants = new Set<string>();
    let currentLevel = [userId];

    while (currentLevel.length > 0) {
      const children = await (this.prisma as any).users.findMany({
        where: {
          manager_id: {
            in: currentLevel,
          },
          deleted_at: null,
        },
        select: {
          id: true,
        },
      });

      const childIds = children
        .map((child: any) => child.id)
        .filter((id: string) => !descendants.has(id));

      for (const childId of childIds) {
        descendants.add(childId);
      }

      currentLevel = childIds;
    }

    return [...descendants];
  }

  async assertCanManageUser(managerId: string, targetUserId: string) {
    if (managerId === targetUserId) {
      throw new ForbiddenException('Vous ne pouvez pas vous modifier vous-même depuis cet écran.');
    }

    const manager = await this.getUserWithAccess(managerId);

    if (this.isSuperAdmin(manager)) {
      return;
    }

    const descendants = await this.getDescendantUserIds(managerId);

    if (!descendants.includes(targetUserId)) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que les profils qui dépendent de vous dans la hiérarchie.',
      );
    }
  }

  async assertCanUseManager(creatorId: string, selectedManagerId: string | null | undefined) {
    if (!selectedManagerId) {
      return;
    }

    const creator = await this.getUserWithAccess(creatorId);

    if (this.isSuperAdmin(creator)) {
      return;
    }

    if (selectedManagerId === creatorId) {
      return;
    }

    const descendants = await this.getDescendantUserIds(creatorId);

    if (!descendants.includes(selectedManagerId)) {
      throw new ForbiddenException(
        'Le supérieur hiérarchique choisi doit être vous-même ou un profil sous votre responsabilité.',
      );
    }
  }

  async getVisibleUserIdsForLogs(currentUserId: string) {
    const currentUser = await this.getUserWithAccess(currentUserId);

    if (this.isSuperAdmin(currentUser)) {
      const users = await (this.prisma as any).users.findMany({
        where: { deleted_at: null },
        select: { id: true },
      });

      return users.map((user: any) => user.id);
    }

    const descendants = await this.getDescendantUserIds(currentUserId);

    return [currentUserId, ...descendants];
  }

  async getGrantablePermissions(currentUserId: string) {
    const user = await this.getUserWithAccess(currentUserId);

    if (this.isSuperAdmin(user)) {
      return (this.prisma as any).permissions.findMany({
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
      });
    }

    return (
      user.roles?.role_permissions?.map((rolePermission: any) => rolePermission.permissions) || []
    );
  }

  async getManageableUsers(currentUserId: string) {
    const currentUser = await this.getUserWithAccess(currentUserId);

    if (this.isSuperAdmin(currentUser)) {
      return (this.prisma as any).users.findMany({
        where: { deleted_at: null },
        orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }],
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          title: true,
          job_title: true,
        },
      });
    }

    const descendantIds = await this.getDescendantUserIds(currentUserId);

    return (this.prisma as any).users.findMany({
      where: {
        id: {
          in: [currentUserId, ...descendantIds],
        },
        deleted_at: null,
      },
      orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }],
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        title: true,
        job_title: true,
      },
    });
  }

  async findUserOrThrow(userId: string) {
    const user = await (this.prisma as any).users.findUnique({
      where: { id: userId },
    });

    if (!user || user.deleted_at) {
      throw new NotFoundException('Profil introuvable.');
    }

    return user;
  }
}