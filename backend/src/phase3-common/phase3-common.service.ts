import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';

@Injectable()
export class Phase3CommonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  async assertFarm(currentUserId: string, farmId?: string | null) {
    if (!farmId) return null;

    return this.accessControl.assertCanAccessRecord(
      currentUserId,
      'FARM',
      'farms',
      farmId,
      { deleted_at: null },
    );
  }

  async assertPlot(currentUserId: string, plotId?: string | null) {
    if (!plotId) return null;

    return this.accessControl.assertCanAccessRecord(
      currentUserId,
      'PLOT',
      'plots',
      plotId,
      { deleted_at: null },
    );
  }

  async assertCompany(currentUserId: string, companyId?: string | null) {
    if (!companyId) return null;

    return this.accessControl.assertCanAccessRecord(
      currentUserId,
      'COMPANY',
      'companies',
      companyId,
      { deleted_at: null },
    );
  }

  async assertProduct(productId?: string | null) {
    if (!productId) return null;

    const product = await this.prisma.products.findFirst({
      where: {
        id: productId,
        deleted_at: null,
      },
    });

    if (!product) {
      throw new BadRequestException('Product not found or archived.');
    }

    return product;
  }

  async assertVariety(varietyId?: string | null, productId?: string | null) {
    if (!varietyId) return null;

    const variety = await this.prisma.product_varieties.findFirst({
      where: {
        id: varietyId,
        deleted_at: null,
        ...(productId ? { product_id: productId } : {}),
      },
    });

    if (!variety) {
      throw new BadRequestException(
        'Variety not found, archived, or inconsistent with the selected product.',
      );
    }

    return variety;
  }

  async assertProject(currentUserId: string, projectId?: string | null) {
    if (!projectId) return null;

    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'AGRICULTURAL_PROJECT',
    );

    const project = await this.prisma.agricultural_projects.findFirst({
      where: {
        id: projectId,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
    });

    if (!project) {
      throw new BadRequestException(
        'Agricultural project not found, archived, or outside your access scope.',
      );
    }

    return project;
  }

  async assertHarvest(currentUserId: string, harvestId?: string | null) {
    if (!harvestId) return null;

    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'HARVEST',
    );

    const harvest = await this.prisma.harvests.findFirst({
      where: {
        id: harvestId,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
    });

    if (!harvest) {
      throw new BadRequestException(
        'Harvest not found, archived, or outside your access scope.',
      );
    }

    return harvest;
  }

  async assertResponsible(responsibleId?: string | null) {
    if (!responsibleId) return null;

    return this.accessControl.findUserOrThrow(responsibleId);
  }

  async validateFarmCompanyConsistency(params: {
    companyId?: string | null;
    farmId?: string | null;
  }) {
    if (!params.companyId || !params.farmId) {
      return;
    }

    const farm = await this.prisma.farms.findFirst({
      where: {
        id: params.farmId,
        company_id: params.companyId,
        deleted_at: null,
      },
    });

    if (!farm) {
      throw new BadRequestException(
        'The selected farm does not belong to the selected company.',
      );
    }
  }

  async validateProjectConsistency(params: {
    currentUserId?: string;
    projectId?: string | null;
    harvestId?: string | null;
    farmId?: string | null;
    plotId?: string | null;
    productId?: string | null;
    varietyId?: string | null;
  }) {
    let project: any = null;
    let harvest: any = null;

    if (params.currentUserId && params.projectId) {
      project = await this.assertProject(params.currentUserId, params.projectId);
    }

    if (params.currentUserId && params.harvestId) {
      harvest = await this.assertHarvest(params.currentUserId, params.harvestId);
    }

    if (harvest) {
      if (params.projectId && harvest.project_id !== params.projectId) {
        throw new BadRequestException(
          'The selected harvest does not belong to the selected agricultural project.',
        );
      }

      if (params.farmId && harvest.farm_id !== params.farmId) {
        throw new BadRequestException(
          'The selected harvest does not belong to the selected farm.',
        );
      }

      if (params.plotId && harvest.plot_id && harvest.plot_id !== params.plotId) {
        throw new BadRequestException(
          'The selected harvest does not belong to the selected plot.',
        );
      }

      if (params.productId && harvest.product_id !== params.productId) {
        throw new BadRequestException(
          'The selected harvest does not match the selected product.',
        );
      }

      if (
        params.varietyId &&
        harvest.variety_id &&
        harvest.variety_id !== params.varietyId
      ) {
        throw new BadRequestException(
          'The selected harvest does not match the selected variety.',
        );
      }
    }

    if (project) {
      if (params.farmId && project.farm_id !== params.farmId) {
        throw new BadRequestException(
          'The selected farm does not match the selected agricultural project.',
        );
      }

      if (params.plotId && project.plot_id && project.plot_id !== params.plotId) {
        throw new BadRequestException(
          'The selected plot does not match the selected agricultural project.',
        );
      }

      if (params.productId && project.product_id !== params.productId) {
        throw new BadRequestException(
          'The selected product does not match the selected agricultural project.',
        );
      }

      if (
        params.varietyId &&
        project.variety_id &&
        project.variety_id !== params.varietyId
      ) {
        throw new BadRequestException(
          'The selected variety does not match the selected agricultural project.',
        );
      }
    }

    if (params.plotId && params.farmId) {
      const plot = await this.prisma.plots.findFirst({
        where: {
          id: params.plotId,
          farm_id: params.farmId,
          deleted_at: null,
        },
      });

      if (!plot) {
        throw new BadRequestException(
          'The selected plot does not belong to the selected farm.',
        );
      }
    }

    if (params.varietyId && params.productId) {
      await this.assertVariety(params.varietyId, params.productId);
    }
  }

async buildDataFromProject(
  currentUserId: string,
  data: Record<string, any>,
) {
  if (!data.project_id) {
    return data;
  }

  const project = await this.assertProject(
    currentUserId,
    data.project_id,
  );

  if (!project) {
    return data;
  }

  return {
    ...data,
    farm_id: project.farm_id,
    plot_id: project.plot_id,
    product_id: project.product_id,
    variety_id: project.variety_id,
  };
}

async buildCompanyFromFarm(
  currentUserId: string,
  data: Record<string, any>,
) {
  if (!data.farm_id) {
    return data;
  }

  const farm = await this.assertFarm(currentUserId, data.farm_id);

  if (!farm) {
    return data;
  }

  return {
    ...data,
    company_id: farm.company_id,
  };
}

  async buildDataFromHarvest(currentUserId: string, data: Record<string, any>) {
    if (!data.harvest_id) {
      return data;
    }

    const harvest = await this.assertHarvest(currentUserId, data.harvest_id);

    if (!harvest) {
      return data;
    }

    return {
      ...data,
      project_id: data.project_id || harvest.project_id,
      farm_id: data.farm_id || harvest.farm_id,
      plot_id: data.plot_id || harvest.plot_id,
      product_id: data.product_id || harvest.product_id,
      variety_id: data.variety_id || harvest.variety_id,
    };
  }

  computeProductionPerPlant(
    data: Record<string, any>,
    options: { forceRecompute?: boolean } = {},
  ) {
    if (
      !options.forceRecompute &&
      data.production_per_plant !== undefined &&
      data.production_per_plant !== null
    ) {
      return data;
    }

    if (!data.quantity_kg || !data.active_plant_count) {
      return data;
    }

    return {
      ...data,
      production_per_plant:
        Number(data.quantity_kg) / Number(data.active_plant_count),
    };
  }

  computeTotalCost(
    data: Record<string, any>,
    options: { forceRecompute?: boolean } = {},
  ) {
    if (
      options.forceRecompute &&
      data.quantity !== undefined &&
      data.quantity !== null &&
      data.unit_cost !== undefined &&
      data.unit_cost !== null
    ) {
      return {
        ...data,
        total_cost: Number(data.quantity) * Number(data.unit_cost),
      };
    }

    if (data.total_cost !== undefined && data.total_cost !== null) {
      return data;
    }

    if (
      data.quantity !== undefined &&
      data.quantity !== null &&
      data.unit_cost !== undefined &&
      data.unit_cost !== null
    ) {
      return {
        ...data,
        total_cost: Number(data.quantity) * Number(data.unit_cost),
      };
    }

    throw new BadRequestException(
      'Total cost is required when quantity and unit cost are not both provided.',
    );
  }

    async calculateProjectPlantMetrics(projectId: string) {
    const project = await this.prisma.agricultural_projects.findFirst({
      where: {
        id: projectId,
        deleted_at: null,
      },
      select: {
        id: true,
        planned_plant_count: true,
        surface_ha: true,
      },
    });

    if (!project) {
      throw new BadRequestException(
        'Agricultural project not found or archived.',
      );
    }

    const plantationGroups = await this.prisma.plantations.groupBy({
      by: ['operation_type'],
      where: {
        project_id: projectId,
        deleted_at: null,
      },
      _sum: {
        plant_quantity: true,
        planted_surface_ha: true,
      },
    });

    const movementGroups = await this.prisma.plant_movements.groupBy({
      by: ['type'],
      where: {
        project_id: projectId,
        deleted_at: null,
      },
      _sum: {
        plant_count: true,
      },
    });

    const plantationTotals = new Map(
      plantationGroups.map((group) => [
        group.operation_type,
        {
          quantity: Number(group._sum.plant_quantity || 0),
          surface: Number(group._sum.planted_surface_ha || 0),
        },
      ]),
    );

    const movementTotals = new Map(
      movementGroups.map((group) => [
        group.type,
        Number(group._sum.plant_count || 0),
      ]),
    );

    const initialPlantCount =
      plantationTotals.get('INITIAL')?.quantity || 0;

    const additionalPlantCount =
      plantationTotals.get('ADDITIONAL')?.quantity || 0;

    const replacementPlantCount =
      plantationTotals.get('REPLACEMENT')?.quantity || 0;

    const establishedPlantCount =
      initialPlantCount + additionalPlantCount;

    const totalPlantedCount =
      establishedPlantCount + replacementPlantCount;

    const mortalityCount =
      movementTotals.get('MORTALITY') || 0;

    const uprootingCount =
      movementTotals.get('UPROOTING') || 0;

    const nonProductiveCount =
      movementTotals.get('NON_PRODUCTIVE') || 0;

    const reactivationCount =
      movementTotals.get('REACTIVATION') || 0;

    const positiveAdjustmentCount =
      movementTotals.get('POSITIVE_ADJUSTMENT') || 0;

    const negativeAdjustmentCount =
      movementTotals.get('NEGATIVE_ADJUSTMENT') || 0;

    const totalLossCount =
      mortalityCount +
      uprootingCount +
      nonProductiveCount +
      negativeAdjustmentCount;

    const totalPositiveCount =
      reactivationCount + positiveAdjustmentCount;

    const activePlantCount = Math.max(
      0,
      totalPlantedCount - totalLossCount + totalPositiveCount,
    );

    const plannedPlantCount = Number(
      project.planned_plant_count || 0,
    );

    const projectSurfaceHa = Number(project.surface_ha || 0);

    const plantedSurfaceHa =
      (plantationTotals.get('INITIAL')?.surface || 0) +
      (plantationTotals.get('ADDITIONAL')?.surface || 0);

    const plannedDensityPerHa =
      plannedPlantCount > 0 && projectSurfaceHa > 0
        ? plannedPlantCount / projectSurfaceHa
        : null;

    const actualDensityPerHa =
      establishedPlantCount > 0 && plantedSurfaceHa > 0
        ? establishedPlantCount / plantedSurfaceHa
        : null;

    const plantingCompletionRate =
      plannedPlantCount > 0
        ? (establishedPlantCount / plannedPlantCount) * 100
        : null;

    const survivalRate =
      totalPlantedCount > 0
        ? (activePlantCount / totalPlantedCount) * 100
        : null;

    return {
      planned_plant_count: plannedPlantCount,
      initial_planted_count: initialPlantCount,
      additional_planted_count: additionalPlantCount,
      replacement_planted_count: replacementPlantCount,
      established_plant_count: establishedPlantCount,
      total_planted_count: totalPlantedCount,

      mortality_count: mortalityCount,
      uprooting_count: uprootingCount,
      non_productive_count: nonProductiveCount,
      reactivation_count: reactivationCount,
      positive_adjustment_count: positiveAdjustmentCount,
      negative_adjustment_count: negativeAdjustmentCount,

      total_loss_count: totalLossCount,
      active_plant_count: activePlantCount,

      planted_surface_ha: plantedSurfaceHa,

      planned_density_per_ha: plannedDensityPerHa,
      actual_density_per_ha: actualDensityPerHa,

      planting_completion_rate: plantingCompletionRate,
      survival_rate: survivalRate,
    };
  }

  async recalculateProjectActivePlantCount(projectId: string) {
    const metrics = await this.calculateProjectPlantMetrics(projectId);

    await this.prisma.agricultural_projects.update({
      where: {
        id: projectId,
      },
      data: {
        active_plant_count: metrics.active_plant_count,
        updated_at: new Date(),
      },
    });

    return metrics;
  }
}