import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { Phase3CommonService } from '../phase3-common/phase3-common.service';
import { CreateTreatmentsDto, UpdateTreatmentsDto } from './dto';

@Injectable()
export class TreatmentsService {
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
      'TREATMENT',
    );

    return this.prisma.treatments.findMany({
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
      'TREATMENT',
    );

    const item = await this.prisma.treatments.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Traitement introuvable.');
    }

    return item;
  }

async create(dto: CreateTreatmentsDto, currentUserId: string) {
  const data = await this.phase3Common.buildDataFromProject(
    currentUserId,
    {
      project_id: dto.project_id,
      treatment_date: new Date(dto.treatment_date),
      product_type: dto.product_type,
      product_name: dto.product_name,
      dose: dto.dose,
      treated_surface_ha: dto.treated_surface_ha,
      cost: dto.cost,
      currency: dto.currency || 'MAD',
      observations: dto.observations,
      created_by_id: currentUserId,
    },
  );

  await this.phase3Common.assertPlot(
    currentUserId,
    data.plot_id,
  );

  return this.prisma.treatments.create({
    data: {
      project_id: data.project_id,
      plot_id: data.plot_id,
      treatment_date: data.treatment_date,
      product_type: data.product_type,
      product_name: data.product_name,
      dose: data.dose,
      treated_surface_ha: data.treated_surface_ha,
      cost: data.cost,
      currency: data.currency,
      observations: data.observations,
      created_by_id: data.created_by_id,
    },
    include: this.includeRelations,
  });
}

async update(
  id: string,
  dto: UpdateTreatmentsDto,
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

  return this.prisma.treatments.update({
    where: {id},
    data: {
      project_id: projectId,
      plot_id: context.plot_id,
      treatment_date: dto.treatment_date
        ? new Date(dto.treatment_date)
        : undefined,
      product_type: dto.product_type,
      product_name: dto.product_name,
      dose: dto.dose,
      treated_surface_ha: dto.treated_surface_ha,
      cost: dto.cost,
      currency: dto.currency,
      observations: dto.observations,
      updated_at: new Date(),
    },
    include: this.includeRelations,
  });
}

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.prisma.treatments.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}