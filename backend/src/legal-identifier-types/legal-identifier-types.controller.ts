import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { LegalIdentifierTypesService } from './legal-identifier-types.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('legal-identifier-types')
export class LegalIdentifierTypesController {
  constructor(
    private readonly legalIdentifierTypesService: LegalIdentifierTypesService,
  ) {}

  @RequirePermission('legal-identifier-types', 'VIEW')
  @Get()
  findAll(@Query('countryCode') countryCode?: string) {
    if (countryCode) {
      return this.legalIdentifierTypesService.findByCountry(countryCode);
    }

    return this.legalIdentifierTypesService.findAll();
  }
}