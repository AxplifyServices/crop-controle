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
import { CreateTreatmentsDto, UpdateTreatmentsDto } from './dto';
import { TreatmentsService } from './treatments.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @RequirePermission('treatments', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.treatmentsService.findAll(user.sub);
  }

  @RequirePermission('treatments', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.treatmentsService.findOne(id, user.sub);
  }

  @RequirePermission('treatments', 'CREATE')
  @Post()
  create(@Body() dto: CreateTreatmentsDto, @CurrentUser() user: any) {
    return this.treatmentsService.create(dto, user.sub);
  }

  @RequirePermission('treatments', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentsDto,
    @CurrentUser() user: any,
  ) {
    return this.treatmentsService.update(id, dto, user.sub);
  }

  @RequirePermission('treatments', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.treatmentsService.remove(id, user.sub);
  }
}