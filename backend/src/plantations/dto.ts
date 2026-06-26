import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { plantation_operation_type_enum } from '@prisma/client';

export class CreatePlantationsDto {
  @IsUUID()
  project_id!: string;

@IsOptional()
@IsUUID()
plot_id?: string;

  @IsDateString()
  planting_date!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  plant_quantity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  planted_surface_ha?: number;

  @IsEnum(plantation_operation_type_enum)
  operation_type!: plantation_operation_type_enum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
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
@IsUUID()
plot_id?: string;

  @IsOptional()
  @IsDateString()
  planting_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  plant_quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  planted_surface_ha?: number;

  @IsOptional()
  @IsEnum(plantation_operation_type_enum)
  operation_type?: plantation_operation_type_enum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}