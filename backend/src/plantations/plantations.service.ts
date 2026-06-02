import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreatePlantationsDto, currentUserId: string) {
    const project = await this.phase3Common.assertProject(
      currentUserId,
      dto.project_id,
    );

    await this.phase3Common.assertPlot(currentUserId, dto.plot_id);
    await this.phase3Common.assertProduct(dto.product_id);
    await this.phase3Common.assertVariety(dto.variety_id, dto.product_id);

    await this.phase3Common.validateProjectConsistency({
      farmId: project?.farm_id,
      plotId: dto.plot_id,
      productId: dto.product_id,
      varietyId: dto.variety_id,
    });

    return this.prisma.plantations.create({
      data: {
        project_id: dto.project_id,
        plot_id: dto.plot_id,
        product_id: dto.product_id,
        variety_id: dto.variety_id,
        planting_date: new Date(dto.planting_date),
        plant_quantity: dto.plant_quantity,
        density: dto.density,
        category: dto.category,
        total_cost: dto.total_cost,
        currency: dto.currency,
        observations: dto.observations,
        created_by_id: currentUserId,
      },
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdatePlantationsDto, currentUserId: string) {
    const existing = await this.findOne(id, currentUserId);

    const projectId = dto.project_id ?? existing.project_id;
    const plotId = dto.plot_id ?? existing.plot_id;
    const productId = dto.product_id ?? existing.product_id;
    const varietyId = dto.variety_id ?? existing.variety_id;

    const project = await this.phase3Common.assertProject(
      currentUserId,
      projectId,
    );

    await this.phase3Common.assertPlot(currentUserId, plotId);
    await this.phase3Common.assertProduct(productId);
    await this.phase3Common.assertVariety(varietyId, productId);

    await this.phase3Common.validateProjectConsistency({
      farmId: project?.farm_id,
      plotId,
      productId,
      varietyId,
    });

    return this.prisma.plantations.update({
      where: { id },
      data: {
        project_id: dto.project_id,
        plot_id: dto.plot_id,
        product_id: dto.product_id,
        variety_id: dto.variety_id,
        planting_date: dto.planting_date
          ? new Date(dto.planting_date)
          : undefined,
        plant_quantity: dto.plant_quantity,
        density: dto.density,
        category: dto.category,
        total_cost: dto.total_cost,
        currency: dto.currency,
        observations: dto.observations,
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    return this.prisma.plantations.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      include: this.includeRelations,
    });
  }
}