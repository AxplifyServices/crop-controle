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
import { CreatePlantationsDto, UpdatePlantationsDto } from './dto';
import { PlantationsService } from './plantations.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('plantations')
export class PlantationsController {
  constructor(private readonly plantationsService: PlantationsService) {}

  @RequirePermission('plantations', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.plantationsService.findAll(user.sub);
  }

  @RequirePermission('plantations', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plantationsService.findOne(id, user.sub);
  }

  @RequirePermission('plantations', 'CREATE')
  @Post()
  create(@Body() dto: CreatePlantationsDto, @CurrentUser() user: any) {
    return this.plantationsService.create(dto, user.sub);
  }

  @RequirePermission('plantations', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlantationsDto,
    @CurrentUser() user: any,
  ) {
    return this.plantationsService.update(id, dto, user.sub);
  }

  @RequirePermission('plantations', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plantationsService.remove(id, user.sub);
  }
}