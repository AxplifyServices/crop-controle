import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { CreateStationsDto, UpdateStationsDto } from './dto';

@Injectable()
export class StationsService {
  private readonly modelName = 'stations';

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

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

  async findAll(currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'STATION',
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
      'STATION',
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

  async create(dto: CreateStationsDto, currentUserId: string) {
    if (dto.company_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'COMPANY',
        'companies',
        dto.company_id,
        { deleted_at: null },
      );
    }

    if (dto.factory_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'FACTORY',
        'factories',
        dto.factory_id,
        { deleted_at: null },
      );
    }

    await this.assertStationAttachmentIsConsistent(dto);

    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateStationsDto, currentUserId: string) {
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

    if (dto.factory_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'FACTORY',
        'factories',
        dto.factory_id,
        { deleted_at: null },
      );
    }

    await this.assertStationAttachmentIsConsistent(dto);

    return this.model.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.model.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}