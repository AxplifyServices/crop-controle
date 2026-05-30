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
import { CreateStationsDto, UpdateStationsDto } from './dto';
import { StationsService } from './stations.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @RequirePermission('stations', 'VIEW')
  @Get()
  findAll() {
    return this.stationsService.findAll();
  }

  @RequirePermission('stations', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @RequirePermission('stations', 'CREATE')
  @Post()
  create(@Body() dto: CreateStationsDto) {
    return this.stationsService.create(dto);
  }

  @RequirePermission('stations', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStationsDto) {
    return this.stationsService.update(id, dto);
  }

  @RequirePermission('stations', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }
}