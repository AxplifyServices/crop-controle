import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCulturesDto, UpdateCulturesDto } from './dto';

@Injectable()
export class CulturesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cultures.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.cultures.findUnique({
      where: { id },
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
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const [products, plots] = await Promise.all([
      this.prisma.products.count({
        where: {
          culture_id: id,
        },
      }),
      this.prisma.plots.count({
        where: {
          culture_id: id,
          deleted_at: null,
        },
      }),
    ]);

    const total = products + plots;

    if (total > 0) {
      throw new BadRequestException(
        `Suppression impossible : cette culture est liée à ${total} élément(s). Archivez-la plutôt.`,
      );
    }

    return this.prisma.cultures.delete({
      where: { id },
    });
  }
}