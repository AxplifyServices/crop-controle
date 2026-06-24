import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { Phase3CommonService } from '../phase3-common/phase3-common.service';
import { CreateHarvestsDto, UpdateHarvestsDto } from './dto';

@Injectable()
export class HarvestsService {
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
      farms: {
        select: {
          id: true,
          name: true,
          code: true,
          company_id: true,
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
      'HARVEST',
    );

    return this.prisma.harvests.findMany({
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
      'HARVEST',
    );

    const item = await this.prisma.harvests.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Récolte introuvable.');
    }

    return item;
  }

async create(dto: CreateHarvestsDto, currentUserId: string) {
  const data = await this.phase3Common.buildDataFromProject(
    currentUserId,
    {
      project_id: dto.project_id,
      harvest_date: new Date(dto.harvest_date),
      weight_total_kg: dto.weight_total_kg,
      team: dto.team,
      quality_grade: dto.quality_grade,
      observations: dto.observations,
      created_by_id: currentUserId,
    },
  );

  await this.phase3Common.assertFarm(
    currentUserId,
    data.farm_id,
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

  return this.prisma.harvests.create({
    data: {
      project_id: data.project_id,
      farm_id: data.farm_id,
      plot_id: data.plot_id,
      product_id: data.product_id,
      variety_id: data.variety_id,
      harvest_date: data.harvest_date,
      weight_total_kg: data.weight_total_kg,
      team: data.team,
      quality_grade: data.quality_grade,
      observations: data.observations,
      created_by_id: data.created_by_id,
    },
    include: this.includeRelations,
  });
}

async update(
  id: string,
  dto: UpdateHarvestsDto,
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

  await this.phase3Common.assertFarm(
    currentUserId,
    context.farm_id,
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

  return this.prisma.harvests.update({
    where: {id},
    data: {
      project_id: projectId,
      farm_id: context.farm_id,
      plot_id: context.plot_id,
      product_id: context.product_id,
      variety_id: context.variety_id,
      harvest_date: dto.harvest_date
        ? new Date(dto.harvest_date)
        : undefined,
      weight_total_kg: dto.weight_total_kg,
      team: dto.team,
      quality_grade: dto.quality_grade,
      observations: dto.observations,
      updated_at: new Date(),
    },
    include: this.includeRelations,
  });
}

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.prisma.harvests.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}