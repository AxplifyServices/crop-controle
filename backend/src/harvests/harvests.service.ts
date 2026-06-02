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
    await this.phase3Common.assertProject(currentUserId, dto.project_id);
    await this.phase3Common.assertFarm(currentUserId, dto.farm_id);
    await this.phase3Common.assertPlot(currentUserId, dto.plot_id);
    await this.phase3Common.assertProduct(dto.product_id);
    await this.phase3Common.assertVariety(dto.variety_id, dto.product_id);

    await this.phase3Common.validateProjectConsistency({
      farmId: dto.farm_id,
      plotId: dto.plot_id,
      productId: dto.product_id,
      varietyId: dto.variety_id,
    });

    return this.prisma.harvests.create({
      data: {
        project_id: dto.project_id,
        farm_id: dto.farm_id,
        plot_id: dto.plot_id,
        product_id: dto.product_id,
        variety_id: dto.variety_id,
        harvest_date: new Date(dto.harvest_date),
        weight_total_kg: dto.weight_total_kg,
        team: dto.team,
        quality_grade: dto.quality_grade,
        observations: dto.observations,
        created_by_id: currentUserId,
      },
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateHarvestsDto, currentUserId: string) {
    const existing = await this.findOne(id, currentUserId);

    const farmId = dto.farm_id ?? existing.farm_id;
    const plotId = dto.plot_id ?? existing.plot_id;
    const productId = dto.product_id ?? existing.product_id;
    const varietyId = dto.variety_id ?? existing.variety_id;

    await this.phase3Common.assertProject(
      currentUserId,
      dto.project_id ?? existing.project_id,
    );
    await this.phase3Common.assertFarm(currentUserId, farmId);
    await this.phase3Common.assertPlot(currentUserId, plotId);
    await this.phase3Common.assertProduct(productId);
    await this.phase3Common.assertVariety(varietyId, productId);

    await this.phase3Common.validateProjectConsistency({
      farmId,
      plotId,
      productId,
      varietyId,
    });

    return this.prisma.harvests.update({
      where: { id },
      data: {
        project_id: dto.project_id,
        farm_id: dto.farm_id,
        plot_id: dto.plot_id,
        product_id: dto.product_id,
        variety_id: dto.variety_id,
        harvest_date: dto.harvest_date ? new Date(dto.harvest_date) : undefined,
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