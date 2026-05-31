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
import { CreateCompaniesDto, UpdateCompaniesDto } from './dto';
import { CompaniesService } from './companies.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @RequirePermission('companies', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.companiesService.findAll(user.sub);
  }

  @RequirePermission('companies', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.findOne(id, user.sub);
  }

  @RequirePermission('companies', 'CREATE')
  @Post()
  create(@Body() dto: CreateCompaniesDto, @CurrentUser() user: any) {
    return this.companiesService.create(dto, user.sub);
  }

  @RequirePermission('companies', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompaniesDto,
    @CurrentUser() user: any,
  ) {
    return this.companiesService.update(id, dto, user.sub);
  }

  @RequirePermission('companies', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.remove(id, user.sub);
  }
}