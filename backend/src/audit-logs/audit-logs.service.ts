import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  async create(data: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return (this.prisma as any).audit_logs.create({
      data: {
        user_id: data.userId || null,
        action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId || null,
        old_value: data.oldValue ?? null,
        new_value: data.newValue ?? null,
        ip_address: data.ipAddress || null,
        user_agent: data.userAgent || null,
      },
    });
  }

  async findVisibleLogs(currentUserId: string, filters: any = {}) {
    const visibleUserIds = await this.accessControl.getVisibleUserIdsForLogs(currentUserId);

    const logs = await (this.prisma as any).audit_logs.findMany({
      where: {
        user_id: {
          in: visibleUserIds,
        },
        ...(filters.userId ? { user_id: filters.userId } : {}),
        ...(filters.entityType ? { entity_type: filters.entityType } : {}),
        ...(filters.action ? { action: filters.action } : {}),
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            title: true,
            job_title: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 300,
    });

    return logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      oldValue: log.old_value,
      newValue: log.new_value,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
      user: log.users
        ? {
            id: log.users.id,
            email: log.users.email,
            firstName: log.users.first_name,
            lastName: log.users.last_name,
            title: log.users.title,
            jobTitle: log.users.job_title,
          }
        : null,
    }));
  }
}