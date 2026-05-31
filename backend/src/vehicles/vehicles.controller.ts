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
import { CreateVehiclesDto, UpdateVehiclesDto } from './dto';
import { VehiclesService } from './vehicles.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @RequirePermission('vehicles', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.vehiclesService.findAll(user.sub);
  }

  @RequirePermission('vehicles', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vehiclesService.findOne(id, user.sub);
  }

  @RequirePermission('vehicles', 'CREATE')
  @Post()
  create(@Body() dto: CreateVehiclesDto, @CurrentUser() user: any) {
    return this.vehiclesService.create(dto, user.sub);
  }

  @RequirePermission('vehicles', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehiclesDto,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.update(id, dto, user.sub);
  }

  @RequirePermission('vehicles', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vehiclesService.remove(id, user.sub);
  }
}