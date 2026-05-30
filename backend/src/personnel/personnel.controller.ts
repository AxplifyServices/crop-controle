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
import { CreatePersonnelDto, UpdatePersonnelDto } from './dto';
import { PersonnelService } from './personnel.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @RequirePermission('personnel', 'VIEW')
  @Get()
  findAll() {
    return this.personnelService.findAll();
  }

  @RequirePermission('personnel', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personnelService.findOne(id);
  }

  @RequirePermission('personnel', 'CREATE')
  @Post()
  create(@Body() dto: CreatePersonnelDto) {
    return this.personnelService.create(dto);
  }

  @RequirePermission('personnel', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonnelDto) {
    return this.personnelService.update(id, dto);
  }

  @RequirePermission('personnel', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personnelService.remove(id);
  }
}