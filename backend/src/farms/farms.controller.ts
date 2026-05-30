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
import { CreateFarmsDto, UpdateFarmsDto } from './dto';
import { FarmsService } from './farms.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @RequirePermission('farms', 'VIEW')
  @Get()
  findAll() {
    return this.farmsService.findAll();
  }

  @RequirePermission('farms', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmsService.findOne(id);
  }

  @RequirePermission('farms', 'CREATE')
  @Post()
  create(@Body() dto: CreateFarmsDto) {
    return this.farmsService.create(dto);
  }

  @RequirePermission('farms', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFarmsDto) {
    return this.farmsService.update(id, dto);
  }

  @RequirePermission('farms', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmsService.remove(id);
  }
}