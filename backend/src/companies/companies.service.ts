import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompaniesDto, UpdateCompaniesDto } from './dto';
import { AccessControlService } from '../common/access-control/access-control.service';

@Injectable()
export class CompaniesService {
  private readonly modelName = 'companies';

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll(currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'COMPANY',
    );

    return this.model.findMany({
      where: {
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0
          ? {
              AND: [scopedWhere],
            }
          : {}),
      },
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

  async findOne(id: string, currentUserId: string) {
    const scopedWhere = await this.accessControl.getScopedWhere(
      currentUserId,
      'COMPANY',
    );

    const item = await this.model.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(Object.keys(scopedWhere).length > 0
          ? {
              AND: [scopedWhere],
            }
          : {}),
      },
      include: {
        company_legal_identifiers: {
          orderBy: {
            identifier_type: 'asc',
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: CreateCompaniesDto, currentUserId: string) {
    await this.accessControl.assertCanAccessRecord(
      currentUserId,
      'GROUP',
      'groups',
      dto.group_id,
    );

    if (dto.parent_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'COMPANY',
        'companies',
        dto.parent_id,
        { deleted_at: null },
      );
    }

    const { legal_identifiers, ...companyData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const company = await (tx as any).companies.create({
        data: companyData,
      });

      await this.upsertLegalIdentifiers(
        tx,
        company.id,
        company.country_id || company.country || 'MA',
        legal_identifiers,
      );

      return (tx as any).companies.findUnique({
        where: {
          id: company.id,
        },
        include: {
          company_legal_identifiers: {
            orderBy: {
              identifier_type: 'asc',
            },
          },
        },
      });
    });
  }

  async update(id: string, dto: UpdateCompaniesDto, currentUserId: string) {
    await this.findOne(id, currentUserId);

    if (dto.group_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'GROUP',
        'groups',
        dto.group_id,
      );
    }

    if (dto.parent_id) {
      await this.accessControl.assertCanAccessRecord(
        currentUserId,
        'COMPANY',
        'companies',
        dto.parent_id,
        { deleted_at: null },
      );
    }

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
        company.country_id || company.country || 'MA',
        legal_identifiers,
      );

      return (tx as any).companies.findUnique({
        where: {
          id,
        },
        include: {
          company_legal_identifiers: {
            orderBy: {
              identifier_type: 'asc',
            },
          },
        },
      });
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    const [childCompanies, farms, factories, stations, vehicles, personnel] =
      await Promise.all([
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

    const total =
      childCompanies + farms + factories + stations + vehicles + personnel;

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
    legalIdentifiers: Record<string, string | null> | Array<{
      identifier_type?: string | null;
      identifier_value?: string | null;
    }> | null | undefined,
  ) {
    if (!legalIdentifiers) {
      return;
    }

    const countryCode = this.normalizeCountryCode(countryCodeOrId);

    const entries = Array.isArray(legalIdentifiers)
      ? legalIdentifiers
      : Object.entries(legalIdentifiers).map(
          ([identifier_type, identifier_value]) => ({
            identifier_type,
            identifier_value,
          }),
        );

    for (const entry of entries) {
      const identifierType = String(entry.identifier_type || '').trim();

      if (!identifierType) {
        continue;
      }

      const identifierValue =
        entry.identifier_value === undefined ||
        entry.identifier_value === null ||
        String(entry.identifier_value).trim() === ''
          ? null
          : String(entry.identifier_value).trim();

      await tx.company_legal_identifiers.upsert({
        where: {
          company_id_country_code_identifier_type: {
            company_id: companyId,
            country_code: countryCode,
            identifier_type: identifierType,
          },
        },
        create: {
          company_id: companyId,
          country_code: countryCode,
          identifier_type: identifierType,
          identifier_value: identifierValue,
        },
        update: {
          identifier_value: identifierValue,
          updated_at: new Date(),
        },
      });
    }
  }

  private normalizeCountryCode(countryCodeOrId: string) {
    if (!countryCodeOrId) {
      return 'MA';
    }

    const value = String(countryCodeOrId).trim().toUpperCase();

    if (value === 'COUNTRY_MA') return 'MA';
    if (value === 'COUNTRY_ES') return 'ES';

    if (value === 'MAROC' || value === 'MOROCCO' || value === 'MA') {
      return 'MA';
    }

    if (
      value === 'ESPAGNE' ||
      value === 'SPAIN' ||
      value === 'ESPAÑA' ||
      value === 'ES'
    ) {
      return 'ES';
    }

    return value;
  }
}