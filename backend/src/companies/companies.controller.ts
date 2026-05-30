import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CreateCompaniesDto, UpdateCompaniesDto } from './dto';
import { CompaniesService } from './companies.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @RequirePermission('companies', 'VIEW')
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @RequirePermission('companies', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @RequirePermission('companies', 'CREATE')
  @Post()
  create(@Body() dto: CreateCompaniesDto) {
    return this.companiesService.create(dto);
  }

  @RequirePermission('companies', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompaniesDto) {
    return this.companiesService.update(id, dto);
  }

  @RequirePermission('companies', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}