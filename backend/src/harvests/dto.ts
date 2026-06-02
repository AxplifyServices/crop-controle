import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { quality_grade_enum } from '@prisma/client';

export class CreateHarvestsDto {
  @IsUUID()
  project_id!: string;

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

  @IsDateString()
  harvest_date!: string;

  @Type(() => Number)
  @IsNumber()
  weight_total_kg!: number;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsEnum(quality_grade_enum)
  quality_grade?: quality_grade_enum;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdateHarvestsDto {
  @IsOptional()
  @IsUUID()
  project_id?: string;

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
  @IsDateString()
  harvest_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight_total_kg?: number;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsEnum(quality_grade_enum)
  quality_grade?: quality_grade_enum;

  @IsOptional()
  @IsString()
  observations?: string;
}