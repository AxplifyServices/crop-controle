import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private formatPermissions(user: any) {
    return (
      user.roles?.role_permissions?.map((rolePermission: any) => ({
        module: rolePermission.permissions.module,
        action: rolePermission.permissions.action,
      })) || []
    );
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
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

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Utilisateur inactif ou suspendu.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.role_id,
      role: user.roles.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        last_login_at: new Date(),
      },
    });

    return {
      accessToken,
      user: {
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
        permissions: this.formatPermissions(user),
        scopes: user.user_scopes.map((scope) => ({
          id: scope.id,
          entityType: scope.entity_type,
          entityId: scope.entity_id,
        })),
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.users.findUnique({
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

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
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
      permissions: this.formatPermissions(user),
      scopes: user.user_scopes.map((scope) => ({
        id: scope.id,
        entityType: scope.entity_type,
        entityId: scope.entity_id,
      })),
    };
  }
}