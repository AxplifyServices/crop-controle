import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessControlService } from '../common/access-control/access-control.service';
import { Phase3CommonService } from '../phase3-common/phase3-common.service';
import { CreateChargesDto, UpdateChargesDto } from './dto';

@Injectable()
export class ChargesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly phase3Common: Phase3CommonService,
  ) {}

  private get includeRelations() {
    return {
      companies: {
        select: {
          id: true,
          name: true,
          code: true,
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
      agricultural_projects: {
        select: {
          id: true,
          name: true,
          farm_id: true,
          plot_id: true,
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
      'CHARGE',
    );

    return this.prisma.charges.findMany({
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
      'CHARGE',
    );

    const item = await this.prisma.charges.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0 ? { AND: [scopedWhere] } : {}),
      },
      include: this.includeRelations,
    });

    if (!item) {
      throw new NotFoundException('Charge introuvable.');
    }

    return item;
  }

  async create(dto: CreateChargesDto, currentUserId: string) {
    let data: Record<string, any> = {
      company_id: dto.company_id,
      farm_id: dto.farm_id,
      project_id: dto.project_id,
      plot_id: dto.plot_id,
      type: dto.type,
      label: dto.label,
      quantity: dto.quantity,
      unit: dto.unit,
      unit_cost: dto.unit_cost,
      total_cost: dto.total_cost,
      currency: dto.currency,
      supplier: dto.supplier,
      charge_date: new Date(dto.charge_date),
      description: dto.description,
      created_by_id: currentUserId,
    };

    data = await this.phase3Common.buildDataFromProject(currentUserId, data);
    data = this.phase3Common.computeTotalCost(data);

    await this.phase3Common.assertCompany(currentUserId, data.company_id);
    await this.phase3Common.assertFarm(currentUserId, data.farm_id);
    await this.phase3Common.assertProject(currentUserId, data.project_id);
    await this.phase3Common.assertPlot(currentUserId, data.plot_id);

    await this.phase3Common.validateProjectConsistency({
      farmId: data.farm_id,
      plotId: data.plot_id,
    });

    return this.prisma.charges.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateChargesDto, currentUserId: string) {
    const existing = await this.findOne(id, currentUserId);

    let data: Record<string, any> = {
      company_id: dto.company_id,
      farm_id: dto.farm_id,
      project_id: dto.project_id,
      plot_id: dto.plot_id,
      type: dto.type,
      label: dto.label,
      quantity: dto.quantity,
      unit: dto.unit,
      unit_cost: dto.unit_cost,
      total_cost: dto.total_cost,
      currency: dto.currency,
      supplier: dto.supplier,
      charge_date: dto.charge_date ? new Date(dto.charge_date) : undefined,
      description: dto.description,
    };

    data = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    data = await this.phase3Common.buildDataFromProject(currentUserId, data);

    const nextFarmId = data.farm_id ?? existing.farm_id;
    const nextPlotId = data.plot_id ?? existing.plot_id;
    const nextCompanyId = data.company_id ?? existing.company_id;

    data = this.phase3Common.computeTotalCost({
      ...data,
      total_cost: data.total_cost ?? existing.total_cost,
    });

    await this.phase3Common.assertCompany(currentUserId, nextCompanyId);
    await this.phase3Common.assertFarm(currentUserId, nextFarmId);
    await this.phase3Common.assertProject(
      currentUserId,
      data.project_id ?? existing.project_id,
    );
    await this.phase3Common.assertPlot(currentUserId, nextPlotId);

    await this.phase3Common.validateProjectConsistency({
      farmId: nextFarmId,
      plotId: nextPlotId,
    });

    return this.prisma.charges.update({
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

    return this.prisma.charges.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}