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
import { CulturesService } from './cultures.service';
import { CreateCulturesDto, UpdateCulturesDto } from './dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cultures')
export class CulturesController {
  constructor(private readonly culturesService: CulturesService) {}

  @RequirePermission('cultures', 'VIEW')
  @Get()
  findAll() {
    return this.culturesService.findAll();
  }

  @RequirePermission('cultures', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.culturesService.findOne(id);
  }

  @RequirePermission('cultures', 'CREATE')
  @Post()
  create(@Body() dto: CreateCulturesDto) {
    return this.culturesService.create(dto);
  }

  @RequirePermission('cultures', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCulturesDto) {
    return this.culturesService.update(id, dto);
  }

  @RequirePermission('cultures', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.culturesService.remove(id);
  }
}