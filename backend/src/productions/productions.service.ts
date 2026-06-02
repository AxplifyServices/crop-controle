import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { Phase3CommonService } from '../phase3-common/phase3-common.service';
import { CreateProductionsDto, UpdateProductionsDto } from './dto';

@Injectable()
export class ProductionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly phase3Common: Phase3CommonService,
  ) {}

  private get includeRelations() {
    return {
      harvests: {
        select: {
          id: true,
          harvest_date: true,
          weight_total_kg: true,
          project_id: true,
          farm_id: true,
          plot_id: true,
          product_id: true,
          variety_id: true,
        },
      },
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
      'PRODUCTION',
    );

    return this.prisma.productions.findMany({
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
      'PRODUCTION',
    );

    const item = await this.prisma.productions.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Production introuvable.');
    }

    return item;
  }

  async create(dto: CreateProductionsDto, currentUserId: string) {
    let data: Record<string, any> = {
      harvest_id: dto.harvest_id,
      farm_id: dto.farm_id,
      project_id: dto.project_id,
      plot_id: dto.plot_id,
      product_id: dto.product_id,
      variety_id: dto.variety_id,
      production_date: new Date(dto.production_date),
      quantity_kg: dto.quantity_kg,
      quality_grade: dto.quality_grade,
      active_plant_count: dto.active_plant_count,
      production_per_plant: dto.production_per_plant,
      source: dto.source,
      observations: dto.observations,
      created_by_id: currentUserId,
    };

    data = await this.phase3Common.buildDataFromHarvest(currentUserId, data);
    data = await this.phase3Common.buildDataFromProject(currentUserId, data);
    data = this.phase3Common.computeProductionPerPlant(data);

    await this.phase3Common.assertHarvest(currentUserId, data.harvest_id);
    await this.phase3Common.assertProject(currentUserId, data.project_id);
    await this.phase3Common.assertFarm(currentUserId, data.farm_id);
    await this.phase3Common.assertPlot(currentUserId, data.plot_id);
    await this.phase3Common.assertProduct(data.product_id);
    await this.phase3Common.assertVariety(data.variety_id, data.product_id);

    await this.phase3Common.validateProjectConsistency({
      farmId: data.farm_id,
      plotId: data.plot_id,
      productId: data.product_id,
      varietyId: data.variety_id,
    });

    return this.prisma.productions.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateProductionsDto, currentUserId: string) {
    const existing = await this.findOne(id, currentUserId);

    let data: Record<string, any> = {
      harvest_id: dto.harvest_id,
      farm_id: dto.farm_id,
      project_id: dto.project_id,
      plot_id: dto.plot_id,
      product_id: dto.product_id,
      variety_id: dto.variety_id,
      production_date: dto.production_date
        ? new Date(dto.production_date)
        : undefined,
      quantity_kg: dto.quantity_kg,
      quality_grade: dto.quality_grade,
      active_plant_count: dto.active_plant_count,
      production_per_plant: dto.production_per_plant,
      source: dto.source,
      observations: dto.observations,
    };

    data = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    data = await this.phase3Common.buildDataFromHarvest(currentUserId, data);
    data = await this.phase3Common.buildDataFromProject(currentUserId, data);

    const nextFarmId = data.farm_id ?? existing.farm_id;
    const nextProjectId = data.project_id ?? existing.project_id;
    const nextPlotId = data.plot_id ?? existing.plot_id;
    const nextProductId = data.product_id ?? existing.product_id;
    const nextVarietyId = data.variety_id ?? existing.variety_id;

    data = this.phase3Common.computeProductionPerPlant({
      ...data,
      quantity_kg: data.quantity_kg ?? existing.quantity_kg,
      active_plant_count:
        data.active_plant_count ?? existing.active_plant_count,
    });

    await this.phase3Common.assertHarvest(currentUserId, data.harvest_id);
    await this.phase3Common.assertProject(currentUserId, nextProjectId);
    await this.phase3Common.assertFarm(currentUserId, nextFarmId);
    await this.phase3Common.assertPlot(currentUserId, nextPlotId);
    await this.phase3Common.assertProduct(nextProductId);
    await this.phase3Common.assertVariety(nextVarietyId, nextProductId);

    await this.phase3Common.validateProjectConsistency({
      farmId: nextFarmId,
      plotId: nextPlotId,
      productId: nextProductId,
      varietyId: nextVarietyId,
    });

    return this.prisma.productions.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.prisma.productions.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}