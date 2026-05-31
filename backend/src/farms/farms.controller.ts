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
import { CreateFarmsDto, UpdateFarmsDto } from './dto';
import { FarmsService } from './farms.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @RequirePermission('farms', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.farmsService.findAll(user.sub);
  }

  @RequirePermission('farms', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.farmsService.findOne(id, user.sub);
  }

  @RequirePermission('farms', 'CREATE')
  @Post()
  create(@Body() dto: CreateFarmsDto, @CurrentUser() user: any) {
    return this.farmsService.create(dto, user.sub);
  }

  @RequirePermission('farms', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFarmsDto,
    @CurrentUser() user: any,
  ) {
    return this.farmsService.update(id, dto, user.sub);
  }

  @RequirePermission('farms', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.farmsService.remove(id, user.sub);
  }
}