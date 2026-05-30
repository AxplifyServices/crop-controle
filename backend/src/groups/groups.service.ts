import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupsDto, UpdateGroupsDto } from './dto';

@Injectable()
export class GroupsService {
  private readonly modelName = 'groups';

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

  async create(dto: CreateGroupsDto) {
    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateGroupsDto) {
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

    const companies = await this.prisma.companies.count({
      where: {
        group_id: id,
        deleted_at: null,
      },
    });

    if (companies > 0) {
      throw new BadRequestException(
        `Suppression impossible : ce groupe est lié à ${companies} entreprise(s). Supprimez ou archivez d'abord les entreprises rattachées.`,
      );
    }

    return this.model.delete({
      where: { id },
    });
  }
}
