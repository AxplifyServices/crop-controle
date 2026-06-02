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
  getRegions(@Query('countryId') countryId: string) {
    return this.geographyService.getRegions(countryId);
  }

  @Get('cities')
  getCities(
    @Query('countryId') countryId: string,
    @Query('regionId') regionId?: string,
  ) {
    return this.geographyService.getCities(countryId, regionId);
  }
}