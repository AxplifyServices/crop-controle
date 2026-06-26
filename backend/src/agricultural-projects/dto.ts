import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
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
  culture_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  planned_plant_count?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  surface_ha!: number;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  expected_end_date!: string;

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
  culture_id?: string;

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
  @Min(0)
  planned_plant_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
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