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
import { CreateFactoriesDto, UpdateFactoriesDto } from './dto';
import { FactoriesService } from './factories.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @RequirePermission('factories', 'VIEW')
  @Get()
  findAll() {
    return this.factoriesService.findAll();
  }

  @RequirePermission('factories', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.factoriesService.findOne(id);
  }

  @RequirePermission('factories', 'CREATE')
  @Post()
  create(@Body() dto: CreateFactoriesDto) {
    return this.factoriesService.create(dto);
  }

  @RequirePermission('factories', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFactoriesDto) {
    return this.factoriesService.update(id, dto);
  }

  @RequirePermission('factories', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.factoriesService.remove(id);
  }
}