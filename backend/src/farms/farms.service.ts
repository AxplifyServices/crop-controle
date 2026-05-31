import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { CreateFarmsDto, UpdateFarmsDto } from './dto';

@Injectable()
export class FarmsService {
  private readonly modelName = 'farms';

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
      'FARM',
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
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string, currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'FARM',
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
    });

    if (!item) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreateFarmsDto, currentUserId: string) {
    await this.accessControl.assertCanAccessRecord(
      currentUserId,
      'COMPANY',
      'companies',
      dto.company_id,
      { deleted_at: null },
    );

    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateFarmsDto, currentUserId: string) {
    await this.findOne(id, currentUserId);

    if (dto.company_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'COMPANY',
        'companies',
        dto.company_id,
        { deleted_at: null },
      );
    }

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

    const [
      plots,
      agriculturalProjects,
      plantations,
      treatments,
      harvests,
      productions,
      shipments,
      personnel,
      charges,
    ] = await Promise.all([
      this.prisma.plots.count({
        where: {
          farm_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.agricultural_projects.count({
        where: {
          farm_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.plantations.count({
        where: {
          plots: {
            farm_id: id,
          },
        },
      }),
      this.prisma.treatments.count({
        where: {
          plots: {
            farm_id: id,
          },
        },
      }),
      this.prisma.harvests.count({
        where: {
          farm_id: id,
        },
      }),
      this.prisma.productions.count({
        where: {
          farm_id: id,
        },
      }),
      this.prisma.farm_shipments.count({
        where: {
          farm_id: id,
        },
      }),
      this.prisma.personnel.count({
        where: {
          farm_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.charges.count({
        where: {
          farm_id: id,
        },
      }),
    ]);

    const total =
      plots +
      agriculturalProjects +
      plantations +
      treatments +
      harvests +
      productions +
      shipments +
      personnel +
      charges;

    if (total > 0) {
      throw new BadRequestException(
        `Suppression impossible : cette ferme est liée à ${total} élément(s). Supprimez ou archivez d'abord les éléments rattachés.`,
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