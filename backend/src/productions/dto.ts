import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { quality_grade_enum } from '@prisma/client';

export class CreateProductionsDto {
  @IsOptional()
  @IsUUID()
  harvest_id?: string;

  @IsUUID()
  farm_id!: string;

  @IsUUID()
  project_id!: string;

  @IsOptional()
  @IsUUID()
  plot_id?: string;

  @IsUUID()
  product_id!: string;

  @IsOptional()
  @IsUUID()
  variety_id?: string;

  @IsDateString()
  production_date!: string;

  @Type(() => Number)
  @IsNumber()
  quantity_kg!: number;

  @IsOptional()
  @IsEnum(quality_grade_enum)
  quality_grade?: quality_grade_enum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  active_plant_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  production_per_plant?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdateProductionsDto {
  @IsOptional()
  @IsUUID()
  harvest_id?: string;

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
  @IsUUID()
  product_id?: string;

  @IsOptional()
  @IsUUID()
  variety_id?: string;

  @IsOptional()
  @IsDateString()
  production_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity_kg?: number;

  @IsOptional()
  @IsEnum(quality_grade_enum)
  quality_grade?: quality_grade_enum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  active_plant_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  production_per_plant?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}