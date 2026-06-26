import {   BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { Phase3CommonService } from '../phase3-common/phase3-common.service';
import {
  CreateAgriculturalProjectsDto,
  UpdateAgriculturalProjectsDto,
} from './dto';

@Injectable()
export class AgriculturalProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly phase3Common: Phase3CommonService,
  ) {}

  private get includeRelations() {
    return {
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
cultures: {
  select: {
    id: true,
    name: true,
    code: true,
  },
},
agricultural_project_plots: {
  include: {
    plots: {
      select: {
        id: true,
        name: true,
        code: true,
        farm_id: true,
        surface_ha: true,
      },
    },
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

private async resolveProjectPlots(
  currentUserId: string,
  farmId: string,
  plotId?: string,
) {
  if (plotId) {
    await this.phase3Common.assertPlot(
      currentUserId,
      plotId,
    );

    const plot = await this.prisma.plots.findFirst({
      where: {
        id: plotId,
        farm_id: farmId,
        deleted_at: null,
      },
      select: {
        id: true,
        surface_ha: true,
      },
    });

    if (!plot) {
      throw new BadRequestException(
        'La parcelle sélectionnée n’appartient pas à la ferme.',
      );
    }

    return [plot];
  }

  const plots = await this.prisma.plots.findMany({
    where: {
      farm_id: farmId,
      deleted_at: null,
      status: {
        not: 'ARCHIVED',
      },
    },
    select: {
      id: true,
      surface_ha: true,
    },
  });

  if (plots.length === 0) {
    throw new BadRequestException(
      'La ferme ne possède aucune parcelle disponible.',
    );
  }

  return plots;
}  

private validateProjectSurface(
  projectSurface: number,
  plots: Array<{
    id: string;
    surface_ha: any;
  }>,
) {
  const availableSurface = plots.reduce(
    (total, plot) =>
      total + Number(plot.surface_ha ?? 0),
    0,
  );

  if (projectSurface > availableSurface) {
    throw new BadRequestException(
      `La surface du projet (${projectSurface} ha) dépasse la surface disponible des parcelles affectées (${availableSurface} ha).`,
    );
  }
}

private validateProjectDates(
  startDate: Date,
  expectedEndDate: Date,
  endDate?: Date,
) {
  if (expectedEndDate < startDate) {
    throw new BadRequestException(
      'La date de fin prévue doit être postérieure à la date de début.',
    );
  }

  if (endDate && endDate < startDate) {
    throw new BadRequestException(
      'La date de fin réelle doit être postérieure à la date de début.',
    );
  }
}

private async validatePlotAvailability(params: {
  plotIds: string[];
  startDate: Date;
  expectedEndDate: Date;
  excludedProjectId?: string;
}) {
  const conflict =
    await this.prisma.agricultural_project_plots.findFirst({
      where: {
        plot_id: {
          in: params.plotIds,
        },
        agricultural_projects: {
          deleted_at: null,
          ...(params.excludedProjectId
            ? {
                id: {
                  not: params.excludedProjectId,
                },
              }
            : {}),
          start_date: {
            lte: params.expectedEndDate,
          },
          OR: [
            {
              end_date: {
                gte: params.startDate,
              },
            },
            {
              end_date: null,
              expected_end_date: {
                gte: params.startDate,
              },
            },
          ],
        },
      },
      include: {
        plots: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        agricultural_projects: {
          select: {
            id: true,
            name: true,
            start_date: true,
            expected_end_date: true,
          },
        },
      },
    });

  if (conflict) {
    const plotName =
      conflict.plots.name ||
      conflict.plots.code ||
      conflict.plot_id;

    throw new BadRequestException(
      `La parcelle ${plotName} est déjà affectée au projet "${conflict.agricultural_projects.name}" pendant cette période.`,
    );
  }
}

  async findAll(currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'AGRICULTURAL_PROJECT',
    );

    const projects =
      await this.prisma.agricultural_projects.findMany({
        where: {
          deleted_at: null,
          ...(Object.keys(scopedWhere).length > 0
            ? { AND: [scopedWhere] }
            : {}),
        },
        include: this.includeRelations,
        orderBy: {
          created_at: 'desc',
        },
      });

    return Promise.all(
      projects.map(async (project) => ({
        ...project,
        ...(await this.phase3Common.calculateProjectPlantMetrics(
          project.id,
        )),
      })),
    );
  }

  async findOne(id: string, currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'AGRICULTURAL_PROJECT',
    );

    const item =
      await this.prisma.agricultural_projects.findFirst({
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
        'Projet agricole introuvable.',
      );
    }

    return {
      ...item,
      ...(await this.phase3Common.calculateProjectPlantMetrics(
        item.id,
      )),
    };
  }

async create(
  dto: CreateAgriculturalProjectsDto,
  currentUserId: string,
) {
  await this.phase3Common.assertFarm(
    currentUserId,
    dto.farm_id,
  );

  await this.accessControl.assertCanAccessRecord(
    currentUserId,
    'CULTURE',
    'cultures',
    dto.culture_id,
    {
      deleted_at: null,
      status: 'ACTIVE',
    },
  );

  await this.phase3Common.assertResponsible(
    dto.responsible_id,
  );

  const plots = await this.resolveProjectPlots(
    currentUserId,
    dto.farm_id,
    dto.plot_id,
  );

  const startDate = new Date(dto.start_date);
  const expectedEndDate = new Date(
    dto.expected_end_date,
  );

  const endDate = dto.end_date
    ? new Date(dto.end_date)
    : undefined;

  this.validateProjectDates(
    startDate,
    expectedEndDate,
    endDate,
  );

  this.validateProjectSurface(
    dto.surface_ha,
    plots,
  );

  await this.validatePlotAvailability({
    plotIds: plots.map((plot) => plot.id),
    startDate,
    expectedEndDate,
  });

  return this.prisma.$transaction(async (tx) => {
    const project =
      await tx.agricultural_projects.create({
        data: {
          farm_id: dto.farm_id,

          // Compatibilité temporaire avec l’ancien modèle.
          plot_id:
            plots.length === 1
              ? plots[0].id
              : null,

          culture_id: dto.culture_id,

          product_id: null,
          variety_id: null,

          name: dto.name,
          season: dto.season,

          planned_plant_count:
            dto.planned_plant_count ?? 0,

          active_plant_count: 0,

          surface_ha: dto.surface_ha,

          start_date: startDate,
          expected_end_date: expectedEndDate,
          end_date: endDate,

          responsible_id: dto.responsible_id,

          status: dto.status ?? 'PREPARATION',
        },
      });

    await tx.agricultural_project_plots.createMany({
      data: plots.map((plot) => ({
        project_id: project.id,
        plot_id: plot.id,
      })),
      skipDuplicates: true,
    });

    return tx.agricultural_projects.findUnique({
      where: {
        id: project.id,
      },
      include: this.includeRelations,
    });
  });
}

async update(
  id: string,
  dto: UpdateAgriculturalProjectsDto,
  currentUserId: string,
) {
  const existing = await this.findOne(id, currentUserId);

const nextFarmId =
  dto.farm_id ?? existing.farm_id;

const nextCultureId =
  dto.culture_id ?? existing.culture_id;

if (!nextCultureId) {
  throw new BadRequestException(
    'La culture doit être renseignée pour ce projet agricole.',
  );
}

const nextSurfaceHa =
  dto.surface_ha !== undefined
    ? Number(dto.surface_ha)
    : Number(existing.surface_ha ?? 0);

const rawStartDate =
  dto.start_date ?? existing.start_date;

if (!rawStartDate) {
  throw new BadRequestException(
    'La date de début doit être renseignée pour ce projet agricole.',
  );
}

const nextStartDate =
  new Date(rawStartDate);

const rawExpectedEndDate =
  dto.expected_end_date ??
  existing.expected_end_date;

if (!rawExpectedEndDate) {
  throw new BadRequestException(
    'La date de fin prévue doit être renseignée pour ce projet agricole.',
  );
}

const nextExpectedEndDate =
  new Date(rawExpectedEndDate);

  

const nextStatus =
  dto.status ?? existing.status;

const closingStatuses = [
  'SUSPENDED',
  'CANCELLED',
  'FINISHED',
] as const;

const isClosingStatus =
  closingStatuses.includes(
    nextStatus as (typeof closingStatuses)[number],
  );

const isEnteringClosingStatus =
  dto.status !== undefined &&
  dto.status !== existing.status &&
  closingStatuses.includes(
    dto.status as (typeof closingStatuses)[number],
  );

let nextEndDate =
  dto.end_date !== undefined
    ? dto.end_date
      ? new Date(dto.end_date)
      : undefined
    : existing.end_date
      ? new Date(existing.end_date)
      : undefined;

/*
 * Lorsqu’un projet passe à un statut de clôture,
 * la date et l’heure du changement deviennent sa date de fin.
 */
if (isEnteringClosingStatus) {
  nextEndDate = new Date();
}

/*
 * Sécurité pour les anciens projets déjà clôturés,
 * mais dont la date de fin serait encore vide.
 */
if (isClosingStatus && !nextEndDate) {
  nextEndDate = new Date();
}

  /*
   * Une valeur plot_id fournie remplace l’affectation actuelle.
   *
   * Lorsque la ferme change sans plot_id, toutes les parcelles
   * actives de la nouvelle ferme seront affectées.
   *
   * Lorsque ni la ferme ni la parcelle ne changent, les
   * affectations actuelles sont conservées.
   */

if (
  Number.isNaN(nextStartDate.getTime()) ||
  Number.isNaN(nextExpectedEndDate.getTime())
) {
  throw new BadRequestException(
    'Les dates du projet agricole sont invalides.',
  );
}

if (
  nextEndDate &&
  Number.isNaN(nextEndDate.getTime())
) {
  throw new BadRequestException(
    'La date de fin réelle du projet agricole est invalide.',
  );
}

  const mustResolvePlots =
    dto.farm_id !== undefined ||
    dto.plot_id !== undefined;

  await this.phase3Common.assertFarm(
    currentUserId,
    nextFarmId,
  );

  await this.accessControl.assertCanAccessRecord(
    currentUserId,
    'CULTURE',
    'cultures',
    nextCultureId,
    {
      deleted_at: null,
      status: 'ACTIVE',
    },
  );

  await this.phase3Common.assertResponsible(
    dto.responsible_id,
  );

  const currentAssignedPlots =
    existing.agricultural_project_plots.map(
      (association) => ({
        id: association.plot_id,
        surface_ha: association.plots.surface_ha,
      }),
    );

  const nextPlots = mustResolvePlots
    ? await this.resolveProjectPlots(
        currentUserId,
        nextFarmId,
        dto.plot_id,
      )
    : currentAssignedPlots;

  this.validateProjectDates(
    nextStartDate,
    nextExpectedEndDate,
    nextEndDate,
  );

  this.validateProjectSurface(
    nextSurfaceHa,
    nextPlots,
  );

  await this.validatePlotAvailability({
    plotIds: nextPlots.map((plot) => plot.id),
    startDate: nextStartDate,
    expectedEndDate: nextExpectedEndDate,
    excludedProjectId: id,
  });

  /*
   * La surface du projet ne peut pas être réduite sous la
   * surface déjà utilisée par ses plantations.
   */
  const plantationSurfaceAggregate =
    await this.prisma.plantations.aggregate({
      where: {
        project_id: id,
        deleted_at: null,
      },
      _sum: {
        planted_surface_ha: true,
      },
    });

  const alreadyPlantedSurface = Number(
    plantationSurfaceAggregate._sum.planted_surface_ha ?? 0,
  );

  if (nextSurfaceHa < alreadyPlantedSurface) {
    throw new BadRequestException(
      `La surface du projet ne peut pas être inférieure à la surface déjà plantée (${alreadyPlantedSurface} ha).`,
    );
  }

  /*
   * On ne peut pas retirer d’un projet une parcelle déjà
   * utilisée par une plantation active.
   */
  const nextPlotIds = nextPlots.map((plot) => plot.id);

  const plantationOnRemovedPlot =
    await this.prisma.plantations.findFirst({
      where: {
        project_id: id,
        deleted_at: null,
        plot_id: {
          notIn: nextPlotIds,
        },
      },
      select: {
        id: true,
        plot_id: true,
        plots: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

  if (plantationOnRemovedPlot) {
    const plotLabel =
      plantationOnRemovedPlot.plots?.name ||
      plantationOnRemovedPlot.plots?.code ||
      plantationOnRemovedPlot.plot_id;

    throw new BadRequestException(
      `La parcelle ${plotLabel} ne peut pas être retirée du projet, car elle contient déjà une plantation.`,
    );
  }

  await this.prisma.$transaction(async (tx) => {
    await tx.agricultural_projects.update({
      where: {
        id,
      },
      data: {
        farm_id:
          dto.farm_id !== undefined
            ? nextFarmId
            : undefined,

        /*
         * plot_id reste utilisé comme indicateur :
         * - une parcelle explicitement choisie : son identifiant ;
         * - toutes les parcelles de la ferme : null.
         */
        plot_id: mustResolvePlots
          ? dto.plot_id ?? null
          : undefined,

        culture_id:
          dto.culture_id !== undefined
            ? nextCultureId
            : undefined,

        /*
         * Compatibilité avec les anciens modules.
         * Les projets ne dépendent plus fonctionnellement
         * des produits et variétés.
         */
        product_id: null,
        variety_id: null,

        name: dto.name,
        season: dto.season,

        planned_plant_count:
          dto.planned_plant_count,

        surface_ha:
          dto.surface_ha !== undefined
            ? nextSurfaceHa
            : undefined,

        start_date:
          dto.start_date !== undefined
            ? nextStartDate
            : undefined,

        expected_end_date:
          dto.expected_end_date !== undefined
            ? nextExpectedEndDate
            : undefined,

end_date:
  isClosingStatus ||
  dto.end_date !== undefined
    ? nextEndDate ?? null
    : undefined,

        responsible_id: dto.responsible_id,
status:
  dto.status !== undefined
    ? nextStatus
    : undefined,
        updated_at: new Date(),
      },
    });

    if (mustResolvePlots) {
      await tx.agricultural_project_plots.deleteMany({
        where: {
          project_id: id,
        },
      });

      await tx.agricultural_project_plots.createMany({
        data: nextPlots.map((plot) => ({
          project_id: id,
          plot_id: plot.id,
        })),
        skipDuplicates: true,
      });
    }
  });

  await this.phase3Common
    .recalculateProjectActivePlantCount(id);

  return this.findOne(id, currentUserId);
}

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.prisma.agricultural_projects.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}