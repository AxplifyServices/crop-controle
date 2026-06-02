import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { project_status_enum } from '@prisma/client';

export class CreateAgriculturalProjectsDto {
  @IsUUID()
  farm_id!: string;

  @IsOptional()
  @IsUUID()
  plot_id?: string;

  @IsUUID()
  product_id!: string;

  @IsOptional()
  @IsUUID()
  variety_id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  plant_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  active_plant_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surface_ha?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  expected_end_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsUUID()
  responsible_id?: string;

  @IsOptional()
  @IsEnum(project_status_enum)
  status?: project_status_enum;
}

export class UpdateAgriculturalProjectsDto {
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @IsOptional()
  @IsUUID()
  plot_id?: string;

  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsOptional()
  @IsUUID()
  variety_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  plant_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  active_plant_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surface_ha?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  expected_end_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsUUID()
  responsible_id?: string;

  @IsOptional()
  @IsEnum(project_status_enum)
  status?: project_status_enum;
}