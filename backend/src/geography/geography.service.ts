import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeographyService {
  constructor(private readonly prisma: PrismaService) {}

  async getCountries() {
    const rows = await this.prisma.geography_locations.findMany({
      where: {
        is_active: true,
      },
      distinct: ['country_code'],
      orderBy: {
        country_name: 'asc',
      },
      select: {
        country_id: true,
        country_code: true,
        country_name: true,
      },
    });

    return rows;
  }

  async getRegions(countryCode: string) {
    return this.prisma.geography_locations.findMany({
      where: {
        country_code: countryCode,
        is_active: true,
      },
      distinct: ['region_code'],
      orderBy: {
        region_name: 'asc',
      },
      select: {
        country_id: true,
        country_code: true,
        region_id: true,
        region_code: true,
        region_name: true,
      },
    });
  }

  async getCities(countryCode: string, regionCode?: string) {
    return this.prisma.geography_locations.findMany({
      where: {
        country_code: countryCode,
        region_code: regionCode || undefined,
        is_active: true,
      },
      orderBy: {
        city_name: 'asc',
      },
      select: {
        country_id: true,
        country_code: true,
        region_id: true,
        region_code: true,
        city_id: true,
        city_name: true,
      },
    });
  }
}