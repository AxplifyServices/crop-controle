import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { CreateFactoriesDto, UpdateFactoriesDto } from './dto';

@Injectable()
export class FactoriesService {
  private readonly modelName = 'factories';

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  private async enrichGeography<T extends CreateFactoriesDto | UpdateFactoriesDto>(dto: T) {
    if (!dto.country_id && !dto.region_id && !dto.city_id) {
      return dto;
    }

    const location = await this.prisma.geography_locations.findFirst({
      where: {
        country_id: dto.country_id || undefined,
        region_id: dto.region_id || undefined,
        city_id: dto.city_id || undefined,
        is_active: true,
      },
    });

    if (!location) {
      throw new BadRequestException(
        'La combinaison pays / région / ville est invalide.',
      );
    }

    return {
      ...dto,
      country_id: location.country_id,
      region_id: location.region_id,
      city_id: location.city_id,
      country: location.country_name,
      region: location.region_name,
      city: location.city_name,
    };
  }

  async findAll(currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'FACTORY',
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
      'FACTORY',
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

  async create(dto: CreateFactoriesDto, currentUserId: string) {
    await this.accessControl.assertCanAccessRecord(
      currentUserId,
      'COMPANY',
      'companies',
      dto.company_id,
      { deleted_at: null },
    );

    const data = await this.enrichGeography(dto);

    return this.model.create({
      data,
    });
  }

  async update(id: string, dto: UpdateFactoriesDto, currentUserId: string) {
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

    const data = await this.enrichGeography(dto);

    return this.model.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    const [
      stations,
      receptions,
      shipments,
      lots,
      storageLocations,
      stockMovements,
      personnel,
      conditioningSessions,
      customerOrders,
    ] = await Promise.all([
      this.prisma.stations.count({
        where: {
          factory_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.factory_receptions.count({
        where: {
          factory_id: id,
        },
      }),
      this.prisma.farm_shipments.count({
        where: {
          factory_id: id,
        },
      }),
      this.prisma.lots.count({
        where: {
          factory_id: id,
        },
      }),
      this.prisma.storage_locations.count({
        where: {
          factory_id: id,
        },
      }),
      this.prisma.stock_movements.count({
        where: {
          factory_id: id,
        },
      }),
      this.prisma.personnel.count({
        where: {
          factory_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.conditioning_sessions.count({
        where: {
          factory_id: id,
        },
      }),
      this.prisma.customer_orders.count({
        where: {
          factory_id: id,
        },
      }),
    ]);

    const total =
      stations +
      receptions +
      shipments +
      lots +
      storageLocations +
      stockMovements +
      personnel +
      conditioningSessions +
      customerOrders;

    if (total > 0) {
      throw new BadRequestException(
        `Suppression impossible : cette usine est liée à ${total} élément(s). Supprimez ou archivez d'abord les éléments rattachés.`,
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