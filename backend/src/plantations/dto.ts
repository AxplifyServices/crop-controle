import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {Type} from 'class-transformer';
import {plantation_category_enum} from '@prisma/client';

export class CreatePlantationsDto {
  @IsUUID()
  project_id!: string;

  @IsDateString()
  planting_date!: string;

  @Type(() => Number)
  @IsInt()
  plant_quantity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  density?: number;

  @IsOptional()
  @IsEnum(plantation_category_enum)
  category?: plantation_category_enum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdatePlantationsDto {
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsDateString()
  planting_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  plant_quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  density?: number;

  @IsOptional()
  @IsEnum(plantation_category_enum)
  category?: plantation_category_enum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}