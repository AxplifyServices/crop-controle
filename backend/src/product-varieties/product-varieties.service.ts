import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVarietiesDto, UpdateProductVarietiesDto } from './dto';

@Injectable()
export class ProductVarietiesService {
  private readonly modelName = 'product_varieties';

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

  async create(dto: CreateProductVarietiesDto) {
    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateProductVarietiesDto) {
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

    return this.model.delete({
      where: { id },
    });
  }
}
