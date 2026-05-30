import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFactoriesDto, UpdateFactoriesDto } from './dto';

@Injectable()
export class FactoriesService {
  private readonly modelName = 'factories';

  constructor(private readonly prisma: PrismaService) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll() {
    return this.model.findMany({
      where: { deleted_at: null },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const item = await this.model.findUnique({
      where: { id },
    });

    if (!item || item.deleted_at) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreateFactoriesDto) {
    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateFactoriesDto) {
    await this.findOne(id);

    return this.model.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

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
