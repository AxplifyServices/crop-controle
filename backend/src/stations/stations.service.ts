import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationsDto, UpdateStationsDto } from './dto';

@Injectable()
export class StationsService {
  private readonly modelName = 'stations';

  constructor(private readonly prisma: PrismaService) {}

  private get model() {
      return (this.prisma as any)[this.modelName];
    }

    private async assertStationAttachmentIsConsistent(dto: {
    company_id?: string | null;
    factory_id?: string | null;
  }) {
    if (!dto.company_id || !dto.factory_id) {
      return;
    }

    const factory = await this.prisma.factories.findFirst({
      where: {
        id: dto.factory_id,
        company_id: dto.company_id,
        deleted_at: null,
      },
    });

    if (!factory) {
      throw new BadRequestException(
        'La station ne peut pas être rattachée à une usine qui appartient à une autre entreprise.',
      );
    }
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

  async create(dto: CreateStationsDto) {
    await this.assertStationAttachmentIsConsistent(dto);
    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateStationsDto) {
    await this.findOne(id);
    await this.assertStationAttachmentIsConsistent(dto);

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

    return this.model.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}
