import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductsDto, UpdateProductsDto } from './dto';

@Injectable()
export class ProductsService {
  private readonly modelName = 'products';

  constructor(private readonly prisma: PrismaService) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll() {
    return this.model.findMany({
      where: {},
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const item = await this.model.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreateProductsDto) {
    if (dto.culture_id) {
      const culture = await this.prisma.cultures.findUnique({
        where: {
          id: dto.culture_id,
        },
      });

      if (!culture) {
        throw new BadRequestException('Culture introuvable.');
      }
    }

    return this.model.create({
      data: {
        name: dto.name,
        code: dto.code,
        culture_id: dto.culture_id,
        description: dto.description,
        default_unit: dto.default_unit,
        status: dto.status,
      },
    });
  }

  async update(id: string, dto: UpdateProductsDto) {
    await this.findOne(id);

    if (dto.culture_id) {
      const culture = await this.prisma.cultures.findUnique({
        where: {
          id: dto.culture_id,
        },
      });

      if (!culture) {
        throw new BadRequestException('Culture introuvable.');
      }
    }

    return this.model.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        culture_id: dto.culture_id,
        description: dto.description,
        default_unit: dto.default_unit,
        status: dto.status,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const [
      varieties,
      agriculturalProjects,
      plantations,
      harvests,
      productions,
      lots,
      stockMovements,
      farmShipmentItems,
      factoryReceptionItems,
      customerOrderItems,
      invoiceItems,
    ] = await Promise.all([
      this.prisma.product_varieties.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.agricultural_projects.count({
        where: {
          product_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.plantations.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.harvests.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.productions.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.lots.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.stock_movements.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.farm_shipment_items.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.factory_reception_items.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.customer_order_items.count({
        where: {
          product_id: id,
        },
      }),
      this.prisma.invoice_items.count({
        where: {
          product_id: id,
        },
      }),
    ]);

    const total =
      varieties +
      agriculturalProjects +
      plantations +
      harvests +
      productions +
      lots +
      stockMovements +
      farmShipmentItems +
      factoryReceptionItems +
      customerOrderItems +
      invoiceItems;

    if (total > 0) {
      throw new BadRequestException(
        `Suppression impossible : ce produit est lié à ${total} élément(s). Supprimez ou archivez d'abord les éléments rattachés.`,
      );
    }

    return this.model.delete({
      where: { id },
    });
  }
}