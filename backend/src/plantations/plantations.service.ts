import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { Phase3CommonService } from '../phase3-common/phase3-common.service';
import { CreatePlantationsDto, UpdatePlantationsDto } from './dto';

@Injectable()
export class PlantationsService {
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
          farm_id: true,
          plot_id: true,
          product_id: true,
          variety_id: true,
        },
      },
      plots: {
        select: {
          id: true,
          name: true,
          code: true,
          farm_id: true,
        },
      },
      products: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      product_varieties: {
        select: {
          id: true,
          name: true,
          code: true,
          product_id: true,
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
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'PLANTATION',
    );

    return this.prisma.plantations.findMany({
      where: {
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
      include: this.includeRelations,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string, currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'PLANTATION',
    );

    const item = await this.prisma.plantations.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Plantation introuvable.');
    }

    return item;
  }

  async create(
    dto: CreatePlantationsDto,
    currentUserId: string,
  ) {
    const context =
      await this.phase3Common.buildDataFromProject(
        currentUserId,
        {
          project_id: dto.project_id,
        },
      );

    if (!context.plot_id) {
      throw new BadRequestException(
        'Le projet agricole doit être lié à une parcelle.',
      );
    }

    const densityPerHa =
      dto.planted_surface_ha &&
      dto.planted_surface_ha > 0
        ? dto.plant_quantity / dto.planted_surface_ha
        : null;

    const plantation = await this.prisma.plantations.create({
      data: {
        project_id: dto.project_id,
        plot_id: context.plot_id,
        product_id: context.product_id,
        variety_id: context.variety_id,

        planting_date: new Date(dto.planting_date),

        plant_quantity: dto.plant_quantity,

        planted_surface_ha: dto.planted_surface_ha,

        density_per_ha: densityPerHa,

        operation_type: dto.operation_type,

        total_cost: dto.total_cost,

        currency: dto.currency || 'MAD',

        observations: dto.observations,

        created_by_id: currentUserId,
      },
      include: this.includeRelations,
    });

    await this.phase3Common.recalculateProjectActivePlantCount(
      dto.project_id,
    );

    return plantation;
  }

  async update(
    id: string,
    dto: UpdatePlantationsDto,
    currentUserId: string,
  ) {
    const existing = await this.findOne(id, currentUserId);

    const projectId =
      dto.project_id ?? existing.project_id;

    const context =
      await this.phase3Common.buildDataFromProject(
        currentUserId,
        {
          project_id: projectId,
        },
      );

    if (!context.plot_id) {
      throw new BadRequestException(
        'Le projet agricole doit être lié à une parcelle.',
      );
    }

    const plantQuantity =
      dto.plant_quantity ?? existing.plant_quantity;

    const plantedSurfaceHa =
      dto.planted_surface_ha !== undefined
        ? dto.planted_surface_ha
        : existing.planted_surface_ha
          ? Number(existing.planted_surface_ha)
          : undefined;

    const densityPerHa =
      plantedSurfaceHa && plantedSurfaceHa > 0
        ? plantQuantity / plantedSurfaceHa
        : null;

    const updated = await this.prisma.plantations.update({
      where: { id },
      data: {
        project_id: projectId,
        plot_id: context.plot_id,
        product_id: context.product_id,
        variety_id: context.variety_id,

        planting_date: dto.planting_date
          ? new Date(dto.planting_date)
          : undefined,

        plant_quantity: dto.plant_quantity,

        planted_surface_ha: dto.planted_surface_ha,

        density_per_ha: densityPerHa,

        operation_type: dto.operation_type,

        total_cost: dto.total_cost,

        currency: dto.currency,

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

    return updated;
  }

  async remove(id: string, currentUserId: string) {
    const existing = await this.findOne(
      id,
      currentUserId,
    );

    const deleted = await this.prisma.plantations.update({
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

    return deleted;
  }
}