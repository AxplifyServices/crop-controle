import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeographyService {
  constructor(private readonly prisma: PrismaService) {}

  async getCountries() {
    return this.prisma.geography_locations.findMany({
      where: {
        is_active: true,
      },
      distinct: ['country_id'],
      orderBy: {
        country_name: 'asc',
      },
      select: {
        country_id: true,
        country_code: true,
        country_name: true,
      },
    });
  }

  async getRegions(countryId: string) {
    if (!countryId) {
      throw new BadRequestException('countryId est obligatoire.');
    }

    return this.prisma.geography_locations.findMany({
      where: {
        country_id: countryId,
        is_active: true,
      },
      distinct: ['region_id'],
      orderBy: {
        region_name: 'asc',
      },
      select: {
        country_id: true,
        country_code: true,
        country_name: true,
        region_id: true,
        region_code: true,
        region_name: true,
      },
    });
  }

  async getCities(countryId: string, regionId?: string) {
    if (!countryId) {
      throw new BadRequestException('countryId est obligatoire.');
    }

    return this.prisma.geography_locations.findMany({
      where: {
        country_id: countryId,
        region_id: regionId || undefined,
        is_active: true,
      },
      orderBy: {
        city_name: 'asc',
      },
      select: {
        country_id: true,
        country_code: true,
        country_name: true,
        region_id: true,
        region_code: true,
        region_name: true,
        city_id: true,
        city_name: true,
      },
    });
  }

  async findLocationByIds(countryId?: string | null, regionId?: string | null, cityId?: string | null) {
    if (!countryId && !regionId && !cityId) {
      return null;
    }

    const location = await this.prisma.geography_locations.findFirst({
      where: {
        country_id: countryId || undefined,
        region_id: regionId || undefined,
        city_id: cityId || undefined,
        is_active: true,
      },
      orderBy: {
        city_name: 'asc',
      },
    });

    if (!location) {
      throw new BadRequestException(
        'La combinaison pays / région / ville est invalide.',
      );
    }

    return location;
  }
}