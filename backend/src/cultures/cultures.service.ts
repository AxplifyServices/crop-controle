import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCulturesDto, UpdateCulturesDto } from './dto';

@Injectable()
export class CulturesService {
  constructor(private readonly prisma: PrismaService) {}

  private get includeRelations() {
    return {
      products: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    };
  }

  async findAll() {
    return this.prisma.cultures.findMany({
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
    const item = await this.prisma.cultures.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Culture introuvable');
    }

    return item;
  }

  async create(dto: CreateCulturesDto) {
    return this.prisma.cultures.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        status: dto.status,
      },
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateCulturesDto) {
    await this.findOne(id);

    return this.prisma.cultures.update({
      where: { id },
      data: {
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

    return this.prisma.cultures.update({
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