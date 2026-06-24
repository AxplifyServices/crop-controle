import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateTreatmentsDto {
  @IsUUID()
  project_id!: string;

  @IsDateString()
  treatment_date!: string;

  @IsOptional()
  @IsString()
  product_type?: string;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsString()
  dose?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  treated_surface_ha?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdateTreatmentsDto {
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsDateString()
  treatment_date?: string;

  @IsOptional()
  @IsString()
  product_type?: string;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsString()
  dose?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  treated_surface_ha?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}