import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LegalIdentifierTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCountry(countryCode: string) {
    return this.prisma.country_legal_identifier_types.findMany({
      where: {
        country_code: countryCode,
        is_active: true,
      },
      orderBy: {
        display_order: 'asc',
      },
    });
  }

  async findAll() {
    return this.prisma.country_legal_identifier_types.findMany({
      where: {
        is_active: true,
      },
      orderBy: [
        {
          country_code: 'asc',
        },
        {
          display_order: 'asc',
        },
      ],
    });
  }
}