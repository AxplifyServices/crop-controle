import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { entity_status_enum, farm_category_enum } from '@prisma/client';

export class CreateFarmsDto {
  @IsUUID()
  company_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(farm_category_enum)
  category?: farm_category_enum;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surface_ha?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rent_monthly?: number;

  @IsOptional()
  @IsUUID()
  responsible_id?: string;

  @IsOptional()
  @IsEnum(entity_status_enum)
  status?: entity_status_enum;
}

export class UpdateFarmsDto {
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(farm_category_enum)
  category?: farm_category_enum;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surface_ha?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rent_monthly?: number;

  @IsOptional()
  @IsUUID()
  responsible_id?: string;

  @IsOptional()
  @IsEnum(entity_status_enum)
  status?: entity_status_enum;
}