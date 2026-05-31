import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { entity_status_enum, vehicle_type_enum } from '@prisma/client';

export class CreateVehiclesDto {
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsOptional()
  @IsEnum(vehicle_type_enum)
  type?: vehicle_type_enum;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  registration_number?: string;

  @IsOptional()
  @IsString()
  acquisition_mode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rent_monthly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity_kg?: number;

  @IsOptional()
  @IsEnum(entity_status_enum)
  status?: entity_status_enum;
}

export class UpdateVehiclesDto {
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsOptional()
  @IsEnum(vehicle_type_enum)
  type?: vehicle_type_enum;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  registration_number?: string;

  @IsOptional()
  @IsString()
  acquisition_mode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rent_monthly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity_kg?: number;

  @IsOptional()
  @IsEnum(entity_status_enum)
  status?: entity_status_enum;
}