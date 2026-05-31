import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { CreateGroupsDto, UpdateGroupsDto } from './dto';

@Injectable()
export class GroupsService {
  private readonly modelName = 'groups';

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll(currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'GROUP',
    );

    return this.model.findMany({
      where: {
        ...(Object.keys(scopedWhere).length > 0
          ? {
              AND: [scopedWhere],
            }
          : {}),
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string, currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'GROUP',
    );

    const item = await this.model.findFirst({
      where: {
        id,
        ...(Object.keys(scopedWhere).length > 0
          ? {
              AND: [scopedWhere],
            }
          : {}),
      },
    });

    if (!item) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreateGroupsDto, currentUserId: string) {
    await this.accessControl.getUserWithAccess(currentUserId);

    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateGroupsDto, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.model.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    const companies = await this.prisma.companies.count({
      where: {
        group_id: id,
        deleted_at: null,
      },
    });

    if (companies > 0) {
      throw new BadRequestException(
        `Suppression impossible : ce groupe est lié à ${companies} entreprise(s). Supprimez ou archivez d'abord les entreprises rattachées.`,
      );
    }

    return this.model.delete({
      where: { id },
    });
  }
}