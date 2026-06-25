import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateAgriculturalProjectsDto, currentUserId: string) {
    await this.phase3Common.assertFarm(currentUserId, dto.farm_id);
    await this.phase3Common.assertPlot(currentUserId, dto.plot_id);
    await this.phase3Common.assertProduct(dto.product_id);
    await this.phase3Common.assertVariety(dto.variety_id, dto.product_id);
    await this.phase3Common.assertResponsible(dto.responsible_id);

    await this.phase3Common.validateProjectConsistency({
      farmId: dto.farm_id,
      plotId: dto.plot_id,
      productId: dto.product_id,
      varietyId: dto.variety_id,
    });

    return this.prisma.agricultural_projects.create({
      data: {
        farm_id: dto.farm_id,
        plot_id: dto.plot_id,
        product_id: dto.product_id,
        variety_id: dto.variety_id,
        name: dto.name,
        season: dto.season,
planned_plant_count: dto.planned_plant_count ?? 0,
active_plant_count: 0,
        surface_ha: dto.surface_ha,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        expected_end_date: dto.expected_end_date
          ? new Date(dto.expected_end_date)
          : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
        responsible_id: dto.responsible_id,
        status: dto.status,
      },
      include: this.includeRelations,
    });
  }

  async update(
    id: string,
    dto: UpdateAgriculturalProjectsDto,
    currentUserId: string,
  ) {
    const existing = await this.findOne(id, currentUserId);

    const nextFarmId = dto.farm_id ?? existing.farm_id;
    const nextPlotId = dto.plot_id ?? existing.plot_id;
    const nextProductId = dto.product_id ?? existing.product_id;
    const nextVarietyId = dto.variety_id ?? existing.variety_id;

    await this.phase3Common.assertFarm(currentUserId, dto.farm_id);
    await this.phase3Common.assertPlot(currentUserId, dto.plot_id);
    await this.phase3Common.assertProduct(dto.product_id);
    await this.phase3Common.assertVariety(nextVarietyId, nextProductId);
    await this.phase3Common.assertResponsible(dto.responsible_id);

    await this.phase3Common.validateProjectConsistency({
      farmId: nextFarmId,
      plotId: nextPlotId,
      productId: nextProductId,
      varietyId: nextVarietyId,
    });

    await this.prisma.agricultural_projects.update({
      where: { id },
      data: {
        farm_id: dto.farm_id,
        plot_id: dto.plot_id,
        product_id: dto.product_id,
        variety_id: dto.variety_id,
        name: dto.name,
        season: dto.season,
        planned_plant_count: dto.planned_plant_count,
        surface_ha: dto.surface_ha,
        start_date: dto.start_date
          ? new Date(dto.start_date)
          : undefined,
        expected_end_date: dto.expected_end_date
          ? new Date(dto.expected_end_date)
          : undefined,
        end_date: dto.end_date
          ? new Date(dto.end_date)
          : undefined,
        responsible_id: dto.responsible_id,
        status: dto.status,
        updated_at: new Date(),
      },
    });

    await this.phase3Common.recalculateProjectActivePlantCount(id);

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