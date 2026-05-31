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
import { CreateStationsDto, UpdateStationsDto } from './dto';
import { StationsService } from './stations.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @RequirePermission('stations', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.stationsService.findAll(user.sub);
  }

  @RequirePermission('stations', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.stationsService.findOne(id, user.sub);
  }

  @RequirePermission('stations', 'CREATE')
  @Post()
  create(@Body() dto: CreateStationsDto, @CurrentUser() user: any) {
    return this.stationsService.create(dto, user.sub);
  }

  @RequirePermission('stations', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStationsDto,
    @CurrentUser() user: any,
  ) {
    return this.stationsService.update(id, dto, user.sub);
  }

  @RequirePermission('stations', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.stationsService.remove(id, user.sub);
  }
}