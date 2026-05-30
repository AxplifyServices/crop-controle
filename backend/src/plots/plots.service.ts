import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlotsDto, UpdatePlotsDto } from './dto';

@Injectable()
export class PlotsService {
  private readonly modelName = 'plots';

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

async create(dto: CreatePlotsDto) {
  return this.model.create({
    data: {
      farm_id: dto.farm_id,
      culture_id: dto.culture_id,
      code: dto.code,
      name: dto.name,
      surface_ha: dto.surface_ha,
      status: dto.status,
      latitude: dto.latitude,
      longitude: dto.longitude,
    },
  });
}

async update(id: string, dto: UpdatePlotsDto) {
  await this.findOne(id);

  return this.model.update({
    where: { id },
    data: {
      farm_id: dto.farm_id,
      culture_id: dto.culture_id,
      code: dto.code,
      name: dto.name,
      surface_ha: dto.surface_ha,
      status: dto.status,
      latitude: dto.latitude,
      longitude: dto.longitude,
      updated_at: new Date(),
    },
  });
}

  async remove(id: string) {
    await this.findOne(id);

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
