import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { GeographyService } from './geography.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @RequirePermission('geography', 'VIEW')
  @Get('countries')
  getCountries() {
    return this.geographyService.getCountries();
  }

  @RequirePermission('geography', 'VIEW')
  @Get('regions')
  getRegions(@Query('countryId') countryId: string) {
    return this.geographyService.getRegions(countryId);
  }

  @RequirePermission('geography', 'VIEW')
  @Get('cities')
  getCities(
    @Query('countryId') countryId: string,
    @Query('regionId') regionId?: string,
  ) {
    return this.geographyService.getCities(countryId, regionId);
  }
}