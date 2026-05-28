const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');

const modules = [
  {
    folder: 'groups',
    className: 'Groups',
    route: 'groups',
    prismaModel: 'groups',
    softDelete: false,
    dtoFields: ['name', 'description']
  },
  {
    folder: 'companies',
    className: 'Companies',
    route: 'companies',
    prismaModel: 'companies',
    softDelete: true,
    dtoFields: [
      'group_id',
      'parent_id',
      'name',
      'legal_name',
      'code',
      'ice',
      'tax_id',
      'rc',
      'cnss',
      'patente',
      'address',
      'city',
      'region',
      'country',
      'latitude',
      'longitude',
      'responsible_id',
      'status'
    ]
  },
  {
    folder: 'farms',
    className: 'Farms',
    route: 'farms',
    prismaModel: 'farms',
    softDelete: true,
    dtoFields: [
      'company_id',
      'name',
      'code',
      'category',
      'address',
      'city',
      'region',
      'latitude',
      'longitude',
      'surface_ha',
      'rent_monthly',
      'responsible_id',
      'status'
    ]
  },
  {
    folder: 'plots',
    className: 'Plots',
    route: 'plots',
    prismaModel: 'plots',
    softDelete: true,
    dtoFields: [
      'farm_id',
      'code',
      'name',
      'surface_ha',
      'culture',
      'variety',
      'status',
      'latitude',
      'longitude'
    ]
  },
  {
    folder: 'factories',
    className: 'Factories',
    route: 'factories',
    prismaModel: 'factories',
    softDelete: true,
    dtoFields: [
      'company_id',
      'name',
      'code',
      'address',
      'city',
      'region',
      'latitude',
      'longitude',
      'daily_capacity_kg',
      'responsible_id',
      'status'
    ]
  },
  {
    folder: 'stations',
    className: 'Stations',
    route: 'stations',
    prismaModel: 'stations',
    softDelete: true,
    dtoFields: [
      'company_id',
      'factory_id',
      'name',
      'code',
      'daily_capacity_kg',
      'location',
      'latitude',
      'longitude',
      'status'
    ]
  },
  {
    folder: 'products',
    className: 'Products',
    route: 'products',
    prismaModel: 'products',
    softDelete: false,
    dtoFields: [
      'name',
      'code',
      'culture',
      'description',
      'default_unit',
      'status'
    ]
  },
  {
    folder: 'product-varieties',
    className: 'ProductVarieties',
    route: 'product-varieties',
    prismaModel: 'product_varieties',
    softDelete: false,
    dtoFields: [
      'product_id',
      'name',
      'code',
      'description',
      'status'
    ]
  },
  {
    folder: 'vehicles',
    className: 'Vehicles',
    route: 'vehicles',
    prismaModel: 'vehicles',
    softDelete: true,
    dtoFields: [
      'company_id',
      'type',
      'brand',
      'model',
      'registration_number',
      'acquisition_mode',
      'rent_monthly',
      'capacity_kg',
      'status'
    ]
  },
  {
    folder: 'personnel',
    className: 'Personnel',
    route: 'personnel',
    prismaModel: 'personnel',
    softDelete: true,
    dtoFields: [
      'user_id',
      'company_id',
      'farm_id',
      'factory_id',
      'station_id',
      'full_name',
      'grade',
      'contract_type',
      'salary',
      'status'
    ]
  }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function lowerFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function dtoContent(className, fields) {
  const lines = fields
    .map(
      (field) => `  @IsOptional()
  @Allow()
  ${field}?: any;`
    )
    .join('\n\n');

  return `import { Allow, IsOptional } from 'class-validator';

export class Create${className}Dto {
${lines}
}

export class Update${className}Dto {
${lines}
}
`;
}

function serviceContent(mod) {
  const serviceName = `${mod.className}Service`;
  const createDto = `Create${mod.className}Dto`;
  const updateDto = `Update${mod.className}Dto`;

  return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ${createDto}, ${updateDto} } from './dto';

@Injectable()
export class ${serviceName} {
  private readonly modelName = '${mod.prismaModel}';

  constructor(private readonly prisma: PrismaService) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll() {
    return this.model.findMany({
      where: ${mod.softDelete ? `{ deleted_at: null }` : `{}`},
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const item = await this.model.findUnique({
      where: { id },
    });

    if (!item${mod.softDelete ? ` || item.deleted_at` : ``}) {
      throw new NotFoundException('Enregistrement introuvable');
    }

    return item;
  }

  async create(dto: ${createDto}) {
    return this.model.create({
      data: dto,
    });
  }

  async update(id: string, dto: ${updateDto}) {
    await this.findOne(id);

    return this.model.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    ${mod.softDelete ? `return this.model.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });` : `return this.model.delete({
      where: { id },
    });`}
  }
}
`;
}

function controllerContent(mod) {
  const serviceName = `${mod.className}Service`;
  const controllerName = `${mod.className}Controller`;
  const serviceVar = lowerFirst(serviceName);
  const createDto = `Create${mod.className}Dto`;
  const updateDto = `Update${mod.className}Dto`;

  return `import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ${createDto}, ${updateDto} } from './dto';
import { ${serviceName} } from './${mod.folder}.service';

@UseGuards(JwtAuthGuard)
@Controller('${mod.route}')
export class ${controllerName} {
  constructor(private readonly ${serviceVar}: ${serviceName}) {}

  @Get()
  findAll() {
    return this.${serviceVar}.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${serviceVar}.findOne(id);
  }

  @Post()
  create(@Body() dto: ${createDto}) {
    return this.${serviceVar}.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: ${updateDto}) {
    return this.${serviceVar}.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${serviceVar}.remove(id);
  }
}
`;
}

function moduleContent(mod) {
  return `import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ${mod.className}Controller } from './${mod.folder}.controller';
import { ${mod.className}Service } from './${mod.folder}.service';

@Module({
  imports: [PrismaModule],
  controllers: [${mod.className}Controller],
  providers: [${mod.className}Service],
  exports: [${mod.className}Service],
})
export class ${mod.className}Module {}
`;
}

for (const mod of modules) {
  const dir = path.join(SRC, mod.folder);
  ensureDir(dir);

  fs.writeFileSync(path.join(dir, 'dto.ts'), dtoContent(mod.className, mod.dtoFields));
  fs.writeFileSync(path.join(dir, `${mod.folder}.service.ts`), serviceContent(mod));
  fs.writeFileSync(path.join(dir, `${mod.folder}.controller.ts`), controllerContent(mod));
  fs.writeFileSync(path.join(dir, `${mod.folder}.module.ts`), moduleContent(mod));

  console.log(`Generated ${mod.folder}`);
}