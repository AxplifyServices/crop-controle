import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { Phase3CommonService } from '../phase3-common/phase3-common.service';
import {
  CreatePlantMovementsDto,
  UpdatePlantMovementsDto,
} from './dto';

@Injectable()
export class PlantMovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly phase3Common: Phase3CommonService,
  ) {}

  private get includeRelations() {
    return {
      agricultural_projects: {
        select: {
          id: true,
          name: true,
          season: true,
          farm_id: true,
          plot_id: true,
          product_id: true,
          variety_id: true,
        },
      },
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    };
  }

  async findAll(currentUserId: string) {
    const scopedWhere =
      await this.accessControl.getScopedWhere(
        currentUserId,
        'PLANT_MOVEMENT',
      );

    return this.prisma.plant_movements.findMany({
      where: {
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0
          ? { AND: [scopedWhere] }
          : {}),
      },
      include: this.includeRelations,
      orderBy: [
        {
          movement_date: 'desc',
        },
        {
          created_at: 'desc',
        },
      ],
    });
  }

  async findOne(id: string, currentUserId: string) {
    const scopedWhere =
      await this.accessControl.getScopedWhere(
        currentUserId,
        'PLANT_MOVEMENT',
      );

    const item =
      await this.prisma.plant_movements.findFirst({
        where: {
          id,
          deleted_at: null,
          ...(Object.keys(scopedWhere).length > 0
            ? { AND: [scopedWhere] }
            : {}),
        },
        include: this.includeRelations,
      });

    if (!item) {
      throw new NotFoundException(
        'Mouvement de plantes introuvable.',
      );
    }

    return item;
  }

  async create(
    dto: CreatePlantMovementsDto,
    currentUserId: string,
  ) {
    await this.phase3Common.assertProject(
      currentUserId,
      dto.project_id,
    );

    const movement =
      await this.prisma.plant_movements.create({
        data: {
          project_id: dto.project_id,
          movement_date: new Date(dto.movement_date),
          type: dto.type,
          plant_count: dto.plant_count,
          reason: dto.reason,
          observations: dto.observations,
          created_by_id: currentUserId,
        },
        include: this.includeRelations,
      });

    await this.phase3Common.recalculateProjectActivePlantCount(
      dto.project_id,
    );

    return movement;
  }

  async update(
    id: string,
    dto: UpdatePlantMovementsDto,
    currentUserId: string,
  ) {
    const existing = await this.findOne(
      id,
      currentUserId,
    );

    const projectId =
      dto.project_id ?? existing.project_id;

    await this.phase3Common.assertProject(
      currentUserId,
      projectId,
    );

    const movement =
      await this.prisma.plant_movements.update({
        where: { id },
        data: {
          project_id: dto.project_id,
          movement_date: dto.movement_date
            ? new Date(dto.movement_date)
            : undefined,
          type: dto.type,
          plant_count: dto.plant_count,
          reason: dto.reason,
          observations: dto.observations,
          updated_at: new Date(),
        },
        include: this.includeRelations,
      });

    await this.phase3Common.recalculateProjectActivePlantCount(
      projectId,
    );

    if (existing.project_id !== projectId) {
      await this.phase3Common.recalculateProjectActivePlantCount(
        existing.project_id,
      );
    }

    return movement;
  }

  async remove(id: string, currentUserId: string) {
    const existing = await this.findOne(
      id,
      currentUserId,
    );

    const movement =
      await this.prisma.plant_movements.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
        },
        include: this.includeRelations,
      });

    await this.phase3Common.recalculateProjectActivePlantCount(
      existing.project_id,
    );

    return movement;
  }
}