import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreatePlantMovementsDto,
  UpdatePlantMovementsDto,
} from './dto';
import { PlantMovementsService } from './plant-movements.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('plant-movements')
export class PlantMovementsController {
  constructor(
    private readonly plantMovementsService: PlantMovementsService,
  ) {}

  @RequirePermission('plant-movements', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.plantMovementsService.findAll(user.sub);
  }

  @RequirePermission('plant-movements', 'VIEW')
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.plantMovementsService.findOne(
      id,
      user.sub,
    );
  }

  @RequirePermission('plant-movements', 'CREATE')
  @Post()
  create(
    @Body() dto: CreatePlantMovementsDto,
    @CurrentUser() user: any,
  ) {
    return this.plantMovementsService.create(
      dto,
      user.sub,
    );
  }

  @RequirePermission('plant-movements', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlantMovementsDto,
    @CurrentUser() user: any,
  ) {
    return this.plantMovementsService.update(
      id,
      dto,
      user.sub,
    );
  }

  @RequirePermission('plant-movements', 'DELETE')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.plantMovementsService.remove(
      id,
      user.sub,
    );
  }
}