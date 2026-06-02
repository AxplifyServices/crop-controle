import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVarietiesDto, UpdateProductVarietiesDto } from './dto';

@Injectable()
export class ProductVarietiesService {
  private readonly modelName = 'product_varieties';

  constructor(private readonly prisma: PrismaService) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  private get includeRelations() {
    return {
      products: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          culture_id: true,
        },
      },
    };
  }

  async findAll() {
    return this.model.findMany({
      where: {
        deleted_at: null,
      },
      include: this.includeRelations,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const item = await this.model.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreateProductVarietiesDto) {
    const product = await this.prisma.products.findFirst({
      where: {
        id: dto.product_id,
        deleted_at: null,
      },
    });

    if (!product) {
      throw new BadRequestException('Produit introuvable ou archivé.');
    }

    return this.model.create({
      data: {
        product_id: dto.product_id,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        status: dto.status,
      },
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateProductVarietiesDto) {
    await this.findOne(id);

    if (dto.product_id) {
      const product = await this.prisma.products.findFirst({
        where: {
          id: dto.product_id,
          deleted_at: null,
        },
      });

      if (!product) {
        throw new BadRequestException('Produit introuvable ou archivé.');
      }
    }

    return this.model.update({
      where: { id },
      data: {
        product_id: dto.product_id,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        status: dto.status,
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.model.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}