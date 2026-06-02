import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { plot_status_enum } from '@prisma/client';

export class CreatePlotsDto {
  @IsUUID()
  farm_id!: string;

  @IsOptional()
  @IsUUID()
  culture_id?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surface_ha?: number;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsOptional()
  @IsEnum(plot_status_enum)
  status?: plot_status_enum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}

export class UpdatePlotsDto {
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @IsOptional()
  @IsUUID()
  culture_id?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surface_ha?: number;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsOptional()
  @IsEnum(plot_status_enum)
  status?: plot_status_enum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}