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
    culture_id: true,
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

private async getPlantableProject(
  projectId: string,
  currentUserId: string,
) {
  await this.accessControl.assertCanAccessRecord(
    currentUserId,
    'AGRICULTURAL_PROJECT',
    'agricultural_projects',
    projectId,
    {
      deleted_at: null,
    },
  );

  const project =
    await this.prisma.agricultural_projects.findFirst({
      where: {
        id: projectId,
        deleted_at: null,
      },
      include: {
        agricultural_project_plots: {
          include: {
            plots: {
              select: {
                id: true,
                name: true,
                code: true,
                farm_id: true,
              },
            },
          },
        },
      },
    });

  if (!project) {
    throw new NotFoundException(
      'Projet agricole introuvable.',
    );
  }

  if (
    ['FINISHED', 'SUSPENDED', 'CANCELLED'].includes(
      project.status,
    )
  ) {
    throw new BadRequestException(
      'Il est impossible d’ajouter une plantation à un projet terminé, suspendu ou annulé.',
    );
  }

  return project;
}

private resolvePlantationPlot(
  project: any,
  requestedPlotId?: string,
) {
  const assignedPlots =
    project.agricultural_project_plots ?? [];

  if (assignedPlots.length === 0) {
    throw new BadRequestException(
      'Aucune parcelle n’est affectée à ce projet.',
    );
  }

  /*
   * Une parcelle a été explicitement sélectionnée
   * dans le projet.
   */
  if (project.plot_id) {
    if (
      requestedPlotId &&
      requestedPlotId !== project.plot_id
    ) {
      throw new BadRequestException(
        'La parcelle de la plantation doit correspondre à la parcelle définie dans le projet.',
      );
    }

    return project.plot_id;
  }

  /*
   * Le projet n’a pas de parcelle explicite :
   * il couvre toutes les parcelles affectées de la ferme.
   */
  if (!requestedPlotId) {
    throw new BadRequestException(
      'Sélectionnez la parcelle concernée par la plantation.',
    );
  }

  const assigned = assignedPlots.find(
    (item: any) =>
      item.plot_id === requestedPlotId,
  );

  if (!assigned) {
    throw new BadRequestException(
      'La parcelle sélectionnée n’est pas affectée à ce projet.',
    );
  }

  return requestedPlotId;
}

private async validatePlantationSurface(params: {
  projectId: string;
  projectSurface: number;
  requestedSurface?: number;
  excludedPlantationId?: string;
}) {
  if (
    params.requestedSurface === undefined ||
    params.requestedSurface === null
  ) {
    return;
  }

  const aggregate =
    await this.prisma.plantations.aggregate({
      where: {
        project_id: params.projectId,
        deleted_at: null,
        ...(params.excludedPlantationId
          ? {
              id: {
                not: params.excludedPlantationId,
              },
            }
          : {}),
      },
      _sum: {
        planted_surface_ha: true,
      },
    });

  const currentSurface = Number(
    aggregate._sum.planted_surface_ha ?? 0,
  );

  const futureSurface =
    currentSurface + params.requestedSurface;

  if (futureSurface > params.projectSurface) {
    throw new BadRequestException(
      `La surface cumulée des plantations (${futureSurface} ha) dépasse la surface affectée au projet (${params.projectSurface} ha).`,
    );
  }
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
  const project = await this.getPlantableProject(
    dto.project_id,
    currentUserId,
  );

  const plotId = this.resolvePlantationPlot(
    project,
    dto.plot_id,
  );

  const plantedSurface =
    dto.planted_surface_ha !== undefined
      ? Number(dto.planted_surface_ha)
      : undefined;

  await this.validatePlantationSurface({
    projectId: project.id,
    projectSurface: Number(
      project.surface_ha ?? 0,
    ),
    requestedSurface: plantedSurface,
  });

  const densityPerHa =
    plantedSurface && plantedSurface > 0
      ? dto.plant_quantity / plantedSurface
      : null;

  const plantation = await this.prisma.$transaction(
    async (tx) => {
      const created = await tx.plantations.create({
        data: {
          project_id: project.id,
          plot_id: plotId,
          culture_id: project.culture_id,

          product_id: null,
          variety_id: null,

          planting_date: new Date(
            dto.planting_date,
          ),

          plant_quantity: dto.plant_quantity,
          planted_surface_ha: plantedSurface,
          density_per_ha: densityPerHa,

          operation_type: dto.operation_type,

          total_cost: dto.total_cost,
          currency: dto.currency || 'MAD',
          observations: dto.observations,

          created_by_id: currentUserId,
        },
      });

      if (project.status === 'PREPARATION') {
        await tx.agricultural_projects.update({
          where: {
            id: project.id,
          },
          data: {
            status: 'IN_PRODUCTION',
            updated_at: new Date(),
          },
        });
      }

      return created;
    },
  );

  await this.phase3Common
    .recalculateProjectActivePlantCount(
      project.id,
    );

  return this.findOne(
    plantation.id,
    currentUserId,
  );
}

async update(
  id: string,
  dto: UpdatePlantationsDto,
  currentUserId: string,
) {
  const existing = await this.findOne(
    id,
    currentUserId,
  );

  const nextProjectId =
    dto.project_id ?? existing.project_id;

  /*
   * getPlantableProject bloque également la modification
   * lorsque le projet est terminé, suspendu ou annulé.
   *
   * Modifier une plantation change potentiellement la surface
   * et la quantité plantée : cette opération doit donc être
   * interdite sur un projet fermé.
   */
  const project = await this.getPlantableProject(
    nextProjectId,
    currentUserId,
  );

  /*
   * Si le projet possède une parcelle explicitement définie,
   * celle-ci est automatiquement utilisée.
   *
   * Si le projet représente toutes les parcelles de la ferme,
   * dto.plot_id doit identifier la parcelle concernée.
   */
  const requestedPlotId =
    dto.plot_id !== undefined
      ? dto.plot_id
      : nextProjectId === existing.project_id
        ? existing.plot_id
        : undefined;

  const nextPlotId = this.resolvePlantationPlot(
    project,
    requestedPlotId,
  );

  const nextPlantQuantity =
    dto.plant_quantity !== undefined
      ? Number(dto.plant_quantity)
      : Number(existing.plant_quantity);

  const nextPlantedSurface =
    dto.planted_surface_ha !== undefined
      ? Number(dto.planted_surface_ha)
      : existing.planted_surface_ha !== null &&
          existing.planted_surface_ha !== undefined
        ? Number(existing.planted_surface_ha)
        : undefined;

  await this.validatePlantationSurface({
    projectId: nextProjectId,
    projectSurface: Number(
      project.surface_ha ?? 0,
    ),
    requestedSurface: nextPlantedSurface,
    excludedPlantationId: id,
  });

  const densityPerHa =
    nextPlantedSurface &&
    nextPlantedSurface > 0
      ? nextPlantQuantity / nextPlantedSurface
      : null;

  const updated =
    await this.prisma.$transaction(async (tx) => {
      const plantation =
        await tx.plantations.update({
          where: {
            id,
          },
          data: {
            project_id: nextProjectId,
            plot_id: nextPlotId,
            culture_id: project.culture_id,

            /*
             * Compatibilité temporaire avec l’ancien modèle.
             */
            product_id: null,
            variety_id: null,

            planting_date:
              dto.planting_date !== undefined
                ? new Date(dto.planting_date)
                : undefined,

            plant_quantity:
              dto.plant_quantity !== undefined
                ? nextPlantQuantity
                : undefined,

            planted_surface_ha:
              dto.planted_surface_ha !== undefined
                ? nextPlantedSurface
                : undefined,

            density_per_ha: densityPerHa,

            operation_type: dto.operation_type,
            total_cost: dto.total_cost,
            currency: dto.currency,
            observations: dto.observations,
            updated_at: new Date(),
          },
        });

      /*
       * Une plantation déplacée vers un projet en préparation
       * fait passer ce nouveau projet en production.
       */
      if (project.status === 'PREPARATION') {
        await tx.agricultural_projects.update({
          where: {
            id: nextProjectId,
          },
          data: {
            status: 'IN_PRODUCTION',
            updated_at: new Date(),
          },
        });
      }

      return plantation;
    });

  await this.phase3Common
    .recalculateProjectActivePlantCount(
      nextProjectId,
    );

  if (existing.project_id !== nextProjectId) {
    await this.phase3Common
      .recalculateProjectActivePlantCount(
        existing.project_id,
      );
  }

  return this.findOne(
    updated.id,
    currentUserId,
  );
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