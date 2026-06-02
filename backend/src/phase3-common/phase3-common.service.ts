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
      throw new BadRequestException('Produit introuvable ou archivé.');
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
        'Variété introuvable, archivée ou incohérente avec le produit.',
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
        'Projet agricole introuvable, archivé ou hors périmètre.',
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
        'Récolte introuvable, archivée ou hors périmètre.',
      );
    }

    return harvest;
  }

  async assertResponsible(responsibleId?: string | null) {
    if (!responsibleId) return null;

    return this.accessControl.findUserOrThrow(responsibleId);
  }

  async validateProjectConsistency(params: {
    farmId?: string | null;
    plotId?: string | null;
    productId?: string | null;
    varietyId?: string | null;
  }) {
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
          'La parcelle sélectionnée ne correspond pas à la ferme sélectionnée.',
        );
      }
    }

    if (params.varietyId && params.productId) {
      await this.assertVariety(params.varietyId, params.productId);
    }
  }

  async buildDataFromProject(currentUserId: string, data: Record<string, any>) {
    if (!data.project_id) {
      return data;
    }

    const project = await this.assertProject(currentUserId, data.project_id);

    if (!project) {
      return data;
    }

    return {
      ...data,
      farm_id: data.farm_id || project.farm_id,
      plot_id: data.plot_id || project.plot_id,
      product_id: data.product_id || project.product_id,
      variety_id: data.variety_id || project.variety_id,
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

  computeProductionPerPlant(data: Record<string, any>) {
    if (
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

  computeTotalCost(data: Record<string, any>) {
    if (data.total_cost !== undefined && data.total_cost !== null) {
      return data;
    }

    if (data.quantity !== undefined && data.unit_cost !== undefined) {
      return {
        ...data,
        total_cost: Number(data.quantity) * Number(data.unit_cost),
      };
    }

    throw new BadRequestException(
      'Le coût total est obligatoire si la quantité et le coût unitaire ne sont pas renseignés.',
    );
  }
}