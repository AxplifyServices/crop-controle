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
import { CreateFactoriesDto, UpdateFactoriesDto } from './dto';
import { FactoriesService } from './factories.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @RequirePermission('factories', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.factoriesService.findAll(user.sub);
  }

  @RequirePermission('factories', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.factoriesService.findOne(id, user.sub);
  }

  @RequirePermission('factories', 'CREATE')
  @Post()
  create(@Body() dto: CreateFactoriesDto, @CurrentUser() user: any) {
    return this.factoriesService.create(dto, user.sub);
  }

  @RequirePermission('factories', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFactoriesDto,
    @CurrentUser() user: any,
  ) {
    return this.factoriesService.update(id, dto, user.sub);
  }

  @RequirePermission('factories', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.factoriesService.remove(id, user.sub);
  }
}