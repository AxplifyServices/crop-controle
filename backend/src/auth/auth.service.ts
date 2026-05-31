import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
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

  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      title: user.title,
      jobTitle: user.job_title,
      assignmentType: user.assignment_type,
      assignmentId: user.assignment_id,
      managerId: user.manager_id,
      status: user.status,
      role: {
        id: user.roles.id,
        name: user.roles.name,
        description: user.roles.description,
      },
      permissions: this.formatPermissions(user),
      scopes: user.user_scopes.map((scope: any) => ({
        id: scope.id,
        entityType: scope.entity_type,
        entityId: scope.entity_id,
      })),
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createRefreshToken(userId: string) {
    const refreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    return refreshToken;
  }

  private async signAccessToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.role_id,
      role: user.roles.name,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
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

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Utilisateur inactif ou suspendu.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        last_login_at: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: this.formatUser(user),
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refresh_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        users: {
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
        },
      },
    });

    if (
      !storedToken ||
      !storedToken.users ||
      storedToken.users.deleted_at ||
      storedToken.users.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException('Session expirée.');
    }

    const accessToken = await this.signAccessToken(storedToken.users);

    return {
      accessToken,
      user: this.formatUser(storedToken.users),
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refresh_tokens.updateMany({
        where: {
          user_id: userId,
          token_hash: this.hashToken(refreshToken),
          revoked_at: null,
        },
        data: {
          revoked_at: new Date(),
        },
      });

      return {
        success: true,
      };
    }

    await this.prisma.refresh_tokens.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    return {
      success: true,
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

    if (!user || user.deleted_at || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    return this.formatUser(user);
  }
}