import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LegalIdentifierTypesService } from './legal-identifier-types.service';

@UseGuards(JwtAuthGuard)
@Controller('legal-identifier-types')
export class LegalIdentifierTypesController {
  constructor(
    private readonly legalIdentifierTypesService: LegalIdentifierTypesService,
  ) {}

  @Get()
  findAll(@Query('countryCode') countryCode?: string) {
    if (countryCode) {
      return this.legalIdentifierTypesService.findByCountry(countryCode);
    }

    return this.legalIdentifierTypesService.findAll();
  }
}