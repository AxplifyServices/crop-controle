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

  private get includeRelations() {
    return {
      cultures: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
      },
      product_varieties: {
        where: {
          deleted_at: null,
        },
        orderBy: {
          name: 'asc',
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

  async create(dto: CreateProductsDto) {
    if (dto.culture_id) {
      const culture = await this.prisma.cultures.findFirst({
        where: {
          id: dto.culture_id,
          deleted_at: null,
        },
      });

      if (!culture) {
        throw new BadRequestException('Culture introuvable ou archivée.');
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
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateProductsDto) {
    await this.findOne(id);

    if (dto.culture_id) {
      const culture = await this.prisma.cultures.findFirst({
        where: {
          id: dto.culture_id,
          deleted_at: null,
        },
      });

      if (!culture) {
        throw new BadRequestException('Culture introuvable ou archivée.');
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