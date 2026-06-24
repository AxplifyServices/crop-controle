import { Injectable, NotFoundException } from '@nestjs/common';
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

async create(dto: CreatePlantationsDto, currentUserId: string) {
  const data = await this.phase3Common.buildDataFromProject(
    currentUserId,
    {
      project_id: dto.project_id,
      planting_date: new Date(dto.planting_date),
      plant_quantity: dto.plant_quantity,
      density: dto.density,
      category: dto.category,
      total_cost: dto.total_cost,
      currency: dto.currency || 'MAD',
      observations: dto.observations,
      created_by_id: currentUserId,
    },
  );

  await this.phase3Common.assertPlot(
    currentUserId,
    data.plot_id,
  );

  await this.phase3Common.assertProduct(data.product_id);

  await this.phase3Common.assertVariety(
    data.variety_id,
    data.product_id,
  );

  await this.phase3Common.validateProjectConsistency({
    currentUserId,
    projectId: data.project_id,
    farmId: data.farm_id,
    plotId: data.plot_id,
    productId: data.product_id,
    varietyId: data.variety_id,
  });

  return this.prisma.plantations.create({
    data: {
      project_id: data.project_id,
      plot_id: data.plot_id,
      product_id: data.product_id,
      variety_id: data.variety_id,
      planting_date: data.planting_date,
      plant_quantity: data.plant_quantity,
      density: data.density,
      category: data.category,
      total_cost: data.total_cost,
      currency: data.currency,
      observations: data.observations,
      created_by_id: data.created_by_id,
    },
    include: this.includeRelations,
  });
}

async update(
  id: string,
  dto: UpdatePlantationsDto,
  currentUserId: string,
) {
  const existing = await this.findOne(id, currentUserId);

  const projectId = dto.project_id ?? existing.project_id;

  const context = await this.phase3Common.buildDataFromProject(
    currentUserId,
    {
      project_id: projectId,
    },
  );

  await this.phase3Common.assertPlot(
    currentUserId,
    context.plot_id,
  );

  await this.phase3Common.assertProduct(context.product_id);

  await this.phase3Common.assertVariety(
    context.variety_id,
    context.product_id,
  );

  await this.phase3Common.validateProjectConsistency({
    currentUserId,
    projectId,
    farmId: context.farm_id,
    plotId: context.plot_id,
    productId: context.product_id,
    varietyId: context.variety_id,
  });

  return this.prisma.plantations.update({
    where: {id},
    data: {
      project_id: projectId,
      plot_id: context.plot_id,
      product_id: context.product_id,
      variety_id: context.variety_id,
      planting_date: dto.planting_date
        ? new Date(dto.planting_date)
        : undefined,
      plant_quantity: dto.plant_quantity,
      density: dto.density,
      category: dto.category,
      total_cost: dto.total_cost,
      currency: dto.currency,
      observations: dto.observations,
      updated_at: new Date(),
    },
    include: this.includeRelations,
  });
}

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.prisma.plantations.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}