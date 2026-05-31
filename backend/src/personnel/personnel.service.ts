import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { CreatePersonnelDto, UpdatePersonnelDto } from './dto';

@Injectable()
export class PersonnelService {
  private readonly modelName = 'personnel';

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  private async assertPersonnelAttachmentIsConsistent(dto: {
    company_id?: string | null;
    farm_id?: string | null;
    factory_id?: string | null;
    station_id?: string | null;
  }) {
    if (dto.farm_id && dto.company_id) {
      const farm = await this.prisma.farms.findFirst({
        where: {
          id: dto.farm_id,
          company_id: dto.company_id,
          deleted_at: null,
        },
      });

      if (!farm) {
        throw new BadRequestException(
          'Le personnel ne peut pas être rattaché à une ferme qui appartient à une autre entreprise.',
        );
      }
    }

    if (dto.factory_id && dto.company_id) {
      const factory = await this.prisma.factories.findFirst({
        where: {
          id: dto.factory_id,
          company_id: dto.company_id,
          deleted_at: null,
        },
      });

      if (!factory) {
        throw new BadRequestException(
          'Le personnel ne peut pas être rattaché à une usine qui appartient à une autre entreprise.',
        );
      }
    }

    if (dto.station_id) {
      const station = await this.prisma.stations.findFirst({
        where: {
          id: dto.station_id,
          deleted_at: null,
        },
        include: {
          factories: true,
        },
      });

      if (!station) {
        throw new BadRequestException('Station introuvable ou archivée.');
      }

      if (dto.company_id) {
        const stationCompanyId =
          station.company_id || station.factories?.company_id || null;

        if (stationCompanyId && stationCompanyId !== dto.company_id) {
          throw new BadRequestException(
            'Le personnel ne peut pas être rattaché à une station qui appartient à une autre entreprise.',
          );
        }
      }

      if (dto.factory_id && station.factory_id && station.factory_id !== dto.factory_id) {
        throw new BadRequestException(
          'Le personnel ne peut pas être rattaché à une station qui appartient à une autre usine.',
        );
      }
    }
  }

  async findAll(currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'PERSONNEL',
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
      'PERSONNEL',
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

  async create(dto: CreatePersonnelDto, currentUserId: string) {
    if (dto.company_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'COMPANY',
        'companies',
        dto.company_id,
        { deleted_at: null },
      );
    }

    if (dto.farm_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'FARM',
        'farms',
        dto.farm_id,
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

    if (dto.station_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'STATION',
        'stations',
        dto.station_id,
        { deleted_at: null },
      );
    }

    await this.assertPersonnelAttachmentIsConsistent(dto);

    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdatePersonnelDto, currentUserId: string) {
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

    if (dto.farm_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'FARM',
        'farms',
        dto.farm_id,
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

    if (dto.station_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'STATION',
        'stations',
        dto.station_id,
        { deleted_at: null },
      );
    }

    await this.assertPersonnelAttachmentIsConsistent(dto);

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