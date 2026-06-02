import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { charge_type_enum } from '@prisma/client';

export class CreateChargesDto {
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsUUID()
  farm_id!: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsUUID()
  plot_id?: string;

  @IsEnum(charge_type_enum)
  type!: charge_type_enum;

  @IsString()
  label!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unit_cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsDateString()
  charge_date!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateChargesDto {
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsUUID()
  plot_id?: string;

  @IsOptional()
  @IsEnum(charge_type_enum)
  type?: charge_type_enum;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unit_cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsDateString()
  charge_date?: string;

  @IsOptional()
  @IsString()
  description?: string;
}