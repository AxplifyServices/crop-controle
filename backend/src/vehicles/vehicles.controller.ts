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
import { CreateVehiclesDto, UpdateVehiclesDto } from './dto';
import { VehiclesService } from './vehicles.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @RequirePermission('vehicles', 'VIEW')
  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @RequirePermission('vehicles', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @RequirePermission('vehicles', 'CREATE')
  @Post()
  create(@Body() dto: CreateVehiclesDto) {
    return this.vehiclesService.create(dto);
  }

  @RequirePermission('vehicles', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehiclesDto) {
    return this.vehiclesService.update(id, dto);
  }

  @RequirePermission('vehicles', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}