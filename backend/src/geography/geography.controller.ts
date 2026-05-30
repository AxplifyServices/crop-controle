import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GeographyService } from './geography.service';

@UseGuards(JwtAuthGuard)
@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('countries')
  getCountries() {
    return this.geographyService.getCountries();
  }

  @Get('regions')
  getRegions(@Query('countryCode') countryCode: string) {
    return this.geographyService.getRegions(countryCode);
  }

  @Get('cities')
  getCities(
    @Query('countryCode') countryCode: string,
    @Query('regionCode') regionCode?: string,
  ) {
    return this.geographyService.getCities(countryCode, regionCode);
  }
}