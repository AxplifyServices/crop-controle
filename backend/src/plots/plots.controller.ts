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
import { CreatePlotsDto, UpdatePlotsDto } from './dto';
import { PlotsService } from './plots.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('plots')
export class PlotsController {
  constructor(private readonly plotsService: PlotsService) {}

  @RequirePermission('plots', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.plotsService.findAll(user.sub);
  }

  @RequirePermission('plots', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plotsService.findOne(id, user.sub);
  }

  @RequirePermission('plots', 'CREATE')
  @Post()
  create(@Body() dto: CreatePlotsDto, @CurrentUser() user: any) {
    return this.plotsService.create(dto, user.sub);
  }

  @RequirePermission('plots', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlotsDto,
    @CurrentUser() user: any,
  ) {
    return this.plotsService.update(id, dto, user.sub);
  }

  @RequirePermission('plots', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plotsService.remove(id, user.sub);
  }
}