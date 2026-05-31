import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { company_status_enum } from '@prisma/client';

export class CreateCompaniesDto {
  @IsUUID()
  group_id!: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  legal_name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  ice?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsString()
  rc?: string;

  @IsOptional()
  @IsString()
  cnss?: string;

  @IsOptional()
  @IsString()
  patente?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsUUID()
  responsible_id?: string;

  @IsOptional()
  @IsEnum(company_status_enum)
  status?: company_status_enum;

  @IsOptional()
  @IsString()
  country_id?: string;

  @IsOptional()
  @IsString()
  region_id?: string;

  @IsOptional()
  @IsString()
  city_id?: string;

  @IsOptional()
  @IsObject()
  legal_identifiers?: Record<string, string | null>;
}

export class UpdateCompaniesDto {
  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  legal_name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  ice?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsString()
  rc?: string;

  @IsOptional()
  @IsString()
  cnss?: string;

  @IsOptional()
  @IsString()
  patente?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsUUID()
  responsible_id?: string;

  @IsOptional()
  @IsEnum(company_status_enum)
  status?: company_status_enum;

  @IsOptional()
  @IsString()
  country_id?: string;

  @IsOptional()
  @IsString()
  region_id?: string;

  @IsOptional()
  @IsString()
  city_id?: string;

  @IsOptional()
  @IsObject()
  legal_identifiers?: Record<string, string | null>;
}