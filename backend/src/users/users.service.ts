import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.users.findMany({
      where: {
        deleted_at: null,
      },
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

    return users.map((user) => ({
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
      subordinates: user.other_users.map((subordinate) => ({
        id: subordinate.id,
        email: subordinate.email,
        firstName: subordinate.first_name,
        lastName: subordinate.last_name,
      })),
      scopes: user.user_scopes.map((scope) => ({
        id: scope.id,
        entityType: scope.entity_type,
        entityId: scope.entity_id,
      })),
      createdAt: user.created_at,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
        users: true,
        other_users: true,
        user_scopes: true,
      },
    });

    if (!user) {
      return null;
    }

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
      subordinates: user.other_users.map((subordinate) => ({
        id: subordinate.id,
        email: subordinate.email,
        firstName: subordinate.first_name,
        lastName: subordinate.last_name,
      })),
      scopes: user.user_scopes.map((scope) => ({
        id: scope.id,
        entityType: scope.entity_type,
        entityId: scope.entity_id,
      })),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}