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
import { CreateHarvestsDto, UpdateHarvestsDto } from './dto';
import { HarvestsService } from './harvests.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('harvests')
export class HarvestsController {
  constructor(private readonly harvestsService: HarvestsService) {}

  @RequirePermission('harvests', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.harvestsService.findAll(user.sub);
  }

  @RequirePermission('harvests', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.harvestsService.findOne(id, user.sub);
  }

  @RequirePermission('harvests', 'CREATE')
  @Post()
  create(@Body() dto: CreateHarvestsDto, @CurrentUser() user: any) {
    return this.harvestsService.create(dto, user.sub);
  }

  @RequirePermission('harvests', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHarvestsDto,
    @CurrentUser() user: any,
  ) {
    return this.harvestsService.update(id, dto, user.sub);
  }

  @RequirePermission('harvests', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.harvestsService.remove(id, user.sub);
  }
}