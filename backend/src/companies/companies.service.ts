import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompaniesDto, UpdateCompaniesDto } from './dto';

@Injectable()
export class CompaniesService {
  private readonly modelName = 'companies';

  constructor(private readonly prisma: PrismaService) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll() {
    return this.model.findMany({
      where: { deleted_at: null },
      include: {
        company_legal_identifiers: {
          orderBy: {
            identifier_type: 'asc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const item = await this.model.findUnique({
      where: { id },
      include: {
        company_legal_identifiers: {
          orderBy: {
            identifier_type: 'asc',
          },
        },
      },
    });

    if (!item || item.deleted_at) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreateCompaniesDto) {
    const { legal_identifiers, ...companyData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const company = await (tx as any).companies.create({
        data: companyData,
      });

      await this.upsertLegalIdentifiers(
        tx,
        company.id,
        companyData.country_id || companyData.country || 'MA',
        legal_identifiers,
      );

      return (tx as any).companies.findUnique({
        where: {
          id: company.id,
        },
        include: {
          company_legal_identifiers: true,
        },
      });
    });
  }

  async update(id: string, dto: UpdateCompaniesDto) {
    await this.findOne(id);

    const { legal_identifiers, ...companyData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const company = await (tx as any).companies.update({
        where: { id },
        data: {
          ...companyData,
          updated_at: new Date(),
        },
      });

      await this.upsertLegalIdentifiers(
        tx,
        company.id,
        companyData.country_id || companyData.country || 'MA',
        legal_identifiers,
      );

      return (tx as any).companies.findUnique({
        where: {
          id,
        },
        include: {
          company_legal_identifiers: true,
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const [
      childCompanies,
      farms,
      factories,
      stations,
      vehicles,
      personnel,
    ] = await Promise.all([
      this.prisma.companies.count({
        where: {
          parent_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.farms.count({
        where: {
          company_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.factories.count({
        where: {
          company_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.stations.count({
        where: {
          company_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.vehicles.count({
        where: {
          company_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.personnel.count({
        where: {
          company_id: id,
          deleted_at: null,
        },
      }),
    ]);

    const total = childCompanies + farms + factories + stations + vehicles + personnel;

    if (total > 0) {
      throw new BadRequestException(
        `Suppression impossible : cette entreprise est liée à ${total} élément(s). Supprimez ou archivez d'abord les éléments rattachés.`,
      );
    }

    return this.model.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  private async upsertLegalIdentifiers(
    tx: any,
    companyId: string,
    countryCodeOrId: string,
    legalIdentifiers: any,
  ) {
    if (!legalIdentifiers) return;

    const countryCode = this.normalizeCountryCode(countryCodeOrId);

    const entries = Array.isArray(legalIdentifiers)
      ? legalIdentifiers
      : Object.entries(legalIdentifiers).map(([identifier_type, identifier_value]) => ({
          identifier_type,
          identifier_value,
        }));

    for (const entry of entries) {
      if (!entry.identifier_type) continue;

      await tx.company_legal_identifiers.upsert({
        where: {
          uq_company_legal_identifier: {
            company_id: companyId,
            country_code: countryCode,
            identifier_type: entry.identifier_type,
          },
        },
        create: {
          company_id: companyId,
          country_code: countryCode,
          identifier_type: entry.identifier_type,
          identifier_value: entry.identifier_value || null,
        },
        update: {
          identifier_value: entry.identifier_value || null,
          updated_at: new Date(),
        },
      });
    }
  }

  private normalizeCountryCode(countryCodeOrId: string) {
    if (!countryCodeOrId) return 'MA';

    const value = String(countryCodeOrId).trim().toUpperCase();

    if (value === 'MAROC' || value === 'MOROCCO') return 'MA';
    if (value === 'ESPAGNE' || value === 'SPAIN' || value === 'ESPAÑA') return 'ES';

    return value;
  }
}