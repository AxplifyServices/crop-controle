import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { CreatePlotsDto, UpdatePlotsDto } from './dto';

@Injectable()
export class PlotsService {
  private readonly modelName = 'plots';

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  private get includeRelations() {
    return {
      cultures: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      farms: {
        select: {
          id: true,
          name: true,
          code: true,
          company_id: true,
          companies: {
            select: {
              id: true,
              name: true,
              code: true,
              group_id: true,
            },
          },
        },
      },
    };
  }

  async findAll(currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'PLOT',
    );

    return this.model.findMany({
      where: {
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0
          ? {
              AND: [scopedWhere],
            }
          : {}),
      },
      include: this.includeRelations,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string, currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'PLOT',
    );

    const item = await this.model.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0
          ? {
              AND: [scopedWhere],
            }
          : {}),
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreatePlotsDto, currentUserId: string) {
    await this.accessControl.assertCanAccessRecord(
      currentUserId,
      'FARM',
      'farms',
      dto.farm_id,
      { deleted_at: null },
    );

    if (dto.culture_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'CULTURE',
        'cultures',
        dto.culture_id,
      );
    }

    return this.model.create({
      data: {
        farm_id: dto.farm_id,
        culture_id: dto.culture_id,
        code: dto.code,
        name: dto.name,
        surface_ha: dto.surface_ha,
        variety: dto.variety,
        status: dto.status,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdatePlotsDto, currentUserId: string) {
    await this.findOne(id, currentUserId);

    if (dto.farm_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'FARM',
        'farms',
        dto.farm_id,
        { deleted_at: null },
      );
    }

    if (dto.culture_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'CULTURE',
        'cultures',
        dto.culture_id,
      );
    }

    return this.model.update({
      where: { id },
      data: {
        farm_id: dto.farm_id,
        culture_id: dto.culture_id,
        code: dto.code,
        name: dto.name,
        surface_ha: dto.surface_ha,
        variety: dto.variety,
        status: dto.status,
        latitude: dto.latitude,
        longitude: dto.longitude,
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    const [
      agriculturalProjects,
      plantations,
      treatments,
      harvests,
      productions,
      charges,
    ] = await Promise.all([
      this.prisma.agricultural_projects.count({
        where: {
          plot_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.plantations.count({
        where: {
          plot_id: id,
        },
      }),
      this.prisma.treatments.count({
        where: {
          plot_id: id,
        },
      }),
      this.prisma.harvests.count({
        where: {
          plot_id: id,
        },
      }),
      this.prisma.productions.count({
        where: {
          plot_id: id,
        },
      }),
      this.prisma.charges.count({
        where: {
          plot_id: id,
        },
      }),
    ]);

    const total =
      agriculturalProjects +
      plantations +
      treatments +
      harvests +
      productions +
      charges;

    if (total > 0) {
      throw new BadRequestException(
        `Suppression impossible : cette parcelle est liée à ${total} élément(s). Supprimez ou archivez d'abord les éléments rattachés.`,
      );
    }

    return this.model.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}