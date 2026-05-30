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
import { CreatePlotsDto, UpdatePlotsDto } from './dto';
import { PlotsService } from './plots.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('plots')
export class PlotsController {
  constructor(private readonly plotsService: PlotsService) {}

  @RequirePermission('plots', 'VIEW')
  @Get()
  findAll() {
    return this.plotsService.findAll();
  }

  @RequirePermission('plots', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plotsService.findOne(id);
  }

  @RequirePermission('plots', 'CREATE')
  @Post()
  create(@Body() dto: CreatePlotsDto) {
    return this.plotsService.create(dto);
  }

  @RequirePermission('plots', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlotsDto) {
    return this.plotsService.update(id, dto);
  }

  @RequirePermission('plots', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plotsService.remove(id);
  }
}