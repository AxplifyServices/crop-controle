import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      status: user.status,
      role: {
        id: user.roles.id,
        name: user.roles.name,
        description: user.roles.description,
      },
      manager: user.users
        ? {
            id: user.users.id,
            email: user.users.email,
            firstName: user.users.first_name,
            lastName: user.users.last_name,
          }
        : null,
      subordinates: user.other_users.map((subordinate: any) => ({
        id: subordinate.id,
        email: subordinate.email,
        firstName: subordinate.first_name,
        lastName: subordinate.last_name,
      })),
      scopes: user.user_scopes.map((scope: any) => ({
        id: scope.id,
        entityType: scope.entity_type,
        entityId: scope.entity_id,
      })),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findAll(currentUserId: string) {
    const currentUser = await this.accessControl.getUserWithAccess(currentUserId);

    const where = this.accessControl.isSuperAdmin(currentUser)
      ? {
          deleted_at: null,
        }
      : {
          id: {
            in: await this.accessControl.getDescendantUserIds(currentUserId),
          },
          deleted_at: null,
        };

    const users = await this.prisma.users.findMany({
      where,
      include: {
        roles: true,
        users: true,
        other_users: true,
        user_scopes: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return users.map((user) => this.formatUser(user));
  }

  async findOne(id: string, currentUserId: string) {
    const currentUser = await this.accessControl.getUserWithAccess(currentUserId);

    if (!this.accessControl.isSuperAdmin(currentUser)) {
      const visibleIds = await this.accessControl.getDescendantUserIds(currentUserId);

      if (!visibleIds.includes(id)) {
        throw new NotFoundException('Utilisateur introuvable.');
      }
    }

    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
        users: true,
        other_users: true,
        user_scopes: true,
      },
    });

    if (!user || user.deleted_at) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return this.formatUser(user);
  }
}