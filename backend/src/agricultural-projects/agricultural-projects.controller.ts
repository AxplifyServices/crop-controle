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
  CreateAgriculturalProjectsDto,
  UpdateAgriculturalProjectsDto,
} from './dto';
import { AgriculturalProjectsService } from './agricultural-projects.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('agricultural-projects')
export class AgriculturalProjectsController {
  constructor(
    private readonly agriculturalProjectsService: AgriculturalProjectsService,
  ) {}

  @RequirePermission('agricultural-projects', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.agriculturalProjectsService.findAll(user.sub);
  }

  @RequirePermission('agricultural-projects', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.agriculturalProjectsService.findOne(id, user.sub);
  }

  @RequirePermission('agricultural-projects', 'CREATE')
  @Post()
  create(
    @Body() dto: CreateAgriculturalProjectsDto,
    @CurrentUser() user: any,
  ) {
    return this.agriculturalProjectsService.create(dto, user.sub);
  }

  @RequirePermission('agricultural-projects', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgriculturalProjectsDto,
    @CurrentUser() user: any,
  ) {
    return this.agriculturalProjectsService.update(id, dto, user.sub);
  }

  @RequirePermission('agricultural-projects', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.agriculturalProjectsService.remove(id, user.sub);
  }
}