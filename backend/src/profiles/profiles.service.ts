import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class ProfilesService {
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
      title: user.title,
      jobTitle: user.job_title,
      status: user.status,
      assignmentType: user.assignment_type,
      assignmentId: user.assignment_id,
      manager: user.users
        ? {
            id: user.users.id,
            firstName: user.users.first_name,
            lastName: user.users.last_name,
            email: user.users.email,
            title: user.users.title,
            jobTitle: user.users.job_title,
          }
        : null,
      role: user.roles
        ? {
            id: user.roles.id,
            name: user.roles.name,
            description: user.roles.description,
          }
        : null,
      permissions:
        user.roles?.role_permissions?.map((rolePermission: any) => ({
          id: rolePermission.permissions.id,
          module: rolePermission.permissions.module,
          action: rolePermission.permissions.action,
          description: rolePermission.permissions.description,
        })) || [],
      scopes:
        user.user_scopes?.map((scope: any) => ({
          id: scope.id,
          entityType: scope.entity_type,
          entityId: scope.entity_id,
        })) || [],
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findAll(currentUserId: string) {
    const currentUser = await this.accessControl.getUserWithAccess(currentUserId);

    let userIds: string[] | undefined;

    if (!this.accessControl.isSuperAdmin(currentUser)) {
      userIds = [currentUserId, ...(await this.accessControl.getDescendantUserIds(currentUserId))];
    }

    const users = await (this.prisma as any).users.findMany({
      where: {
        deleted_at: null,
        ...(userIds ? { id: { in: userIds } } : {}),
      },
      include: {
        users: true,
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
      orderBy: {
        created_at: 'desc',
      },
    });

    return users.map((user: any) => this.formatUser(user));
  }

  async findOne(currentUserId: string, id: string) {
    if (currentUserId !== id) {
      await this.accessControl.assertCanManageUser(currentUserId, id);
    }

    const user = await (this.prisma as any).users.findUnique({
      where: { id },
      include: {
        users: true,
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

    return this.formatUser(user);
  }

async getMeta(currentUserId: string) {
  const permissions = await this.accessControl.getGrantablePermissions(currentUserId);
  const managers = await this.accessControl.getManageableUsers(currentUserId);

  const [groups, companies, farms, factories, stations] = await Promise.all([
    (this.prisma as any).groups.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),

    (this.prisma as any).companies.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),

    (this.prisma as any).farms.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),

    (this.prisma as any).factories.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),

    (this.prisma as any).stations.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return {
    permissions: permissions.map((permission: any) => ({
      id: permission.id,
      module: permission.module,
      action: permission.action,
      description: permission.description,
    })),

    managers: managers.map((user: any) => ({
      id: user.id,
      label: `${user.first_name} ${user.last_name} — ${
        user.title || user.job_title || user.email
      }`,
    })),

    scopeTargets: {
      GROUP: groups.map((item: any) => ({
        id: item.id,
        label: item.name,
      })),

      COMPANY: companies.map((item: any) => ({
        id: item.id,
        label: item.name,
      })),

      FARM: farms.map((item: any) => ({
        id: item.id,
        label: item.name,
      })),

      FACTORY: factories.map((item: any) => ({
        id: item.id,
        label: item.name,
      })),

      STATION: stations.map((item: any) => ({
        id: item.id,
        label: item.name,
      })),
    },
  };
}

  async create(currentUserId: string, dto: CreateProfileDto) {
    if (dto.assignmentType && !dto.assignmentId) {
      throw new BadRequestException('Le périmètre d’affectation est incomplet.');
    }

    await this.accessControl.assertCanUseManager(currentUserId, dto.managerId);
    await this.accessControl.assertCanGrantPermissions(currentUserId, dto.permissions);
    await this.accessControl.assertCanGrantScopes(currentUserId, dto.scopes);

    const existingUser = await (this.prisma as any).users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Un profil existe déjà avec cet email.');
    }

    const permissions = await (this.prisma as any).permissions.findMany({
      where: {
        OR: dto.permissions.map((permission) => ({
          module: permission.module,
          action: permission.action,
        })),
      },
    });

    if (permissions.length !== dto.permissions.length) {
      throw new BadRequestException('Certaines permissions demandées sont introuvables.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return (this.prisma as any).$transaction(async (tx: any) => {
      const role = await tx.roles.create({
        data: {
          name: `profile_${dto.email}_${Date.now()}`.replace(/[^a-zA-Z0-9_@.-]/g, '_'),
          description: `Rôle personnalisé pour ${dto.firstName} ${dto.lastName}`,
          is_system_role: false,
        },
      });

      await tx.role_permissions.createMany({
        data: permissions.map((permission: any) => ({
          role_id: role.id,
          permission_id: permission.id,
        })),
        skipDuplicates: true,
      });

      const user = await tx.users.create({
        data: {
          email: dto.email,
          password_hash: passwordHash,
          first_name: dto.firstName,
          last_name: dto.lastName,
          phone: dto.phone || null,
          title: dto.title || null,
          job_title: dto.jobTitle || null,
          manager_id: dto.managerId || currentUserId,
          role_id: role.id,
          assignment_type: dto.assignmentType || null,
          assignment_id: dto.assignmentId || null,
          status: 'ACTIVE',
        },
      });

      if (dto.scopes.length > 0) {
        await tx.user_scopes.createMany({
          data: dto.scopes.map((scope) => ({
            user_id: user.id,
            entity_type: scope.entityType,
            entity_id: scope.entityId,
          })),
          skipDuplicates: true,
        });
      }

      return this.findOne(currentUserId, user.id);
    });
  }

  async update(currentUserId: string, id: string, dto: UpdateProfileDto) {
    await this.accessControl.assertCanManageUser(currentUserId, id);

    if (dto.managerId) {
      await this.accessControl.assertCanUseManager(currentUserId, dto.managerId);
    }

    if (dto.permissions) {
      await this.accessControl.assertCanGrantPermissions(currentUserId, dto.permissions);
    }

    if (dto.scopes) {
      await this.accessControl.assertCanGrantScopes(currentUserId, dto.scopes);
    }

    const target = await this.accessControl.findUserOrThrow(id);

    return (this.prisma as any).$transaction(async (tx: any) => {
      await tx.users.update({
        where: { id },
        data: {
          first_name: dto.firstName ?? undefined,
          last_name: dto.lastName ?? undefined,
          phone: dto.phone ?? undefined,
          title: dto.title ?? undefined,
          job_title: dto.jobTitle ?? undefined,
          manager_id: dto.managerId ?? undefined,
          status: dto.status ?? undefined,
          assignment_type: dto.assignmentType ?? undefined,
          assignment_id: dto.assignmentId ?? undefined,
        },
      });

      if (dto.permissions) {
        const permissions = await tx.permissions.findMany({
          where: {
            OR: dto.permissions.map((permission) => ({
              module: permission.module,
              action: permission.action,
            })),
          },
        });

        await tx.role_permissions.deleteMany({
          where: {
            role_id: target.role_id,
          },
        });

        if (permissions.length > 0) {
          await tx.role_permissions.createMany({
            data: permissions.map((permission: any) => ({
              role_id: target.role_id,
              permission_id: permission.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (dto.scopes) {
        await tx.user_scopes.deleteMany({
          where: {
            user_id: id,
          },
        });

        if (dto.scopes.length > 0) {
          await tx.user_scopes.createMany({
            data: dto.scopes.map((scope) => ({
              user_id: id,
              entity_type: scope.entityType,
              entity_id: scope.entityId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return this.findOne(currentUserId, id);
    });
  }

  async remove(currentUserId: string, id: string) {
    await this.accessControl.assertCanManageUser(currentUserId, id);

    return (this.prisma as any).users.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deleted_at: new Date(),
      },
    });
  }
}