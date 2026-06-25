import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { plant_movement_type_enum } from '@prisma/client';

export class CreatePlantMovementsDto {
  @IsUUID()
  project_id!: string;

  @IsDateString()
  movement_date!: string;

  @IsEnum(plant_movement_type_enum)
  type!: plant_movement_type_enum;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  plant_count!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdatePlantMovementsDto {
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsDateString()
  movement_date?: string;

  @IsOptional()
  @IsEnum(plant_movement_type_enum)
  type?: plant_movement_type_enum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  plant_count?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}