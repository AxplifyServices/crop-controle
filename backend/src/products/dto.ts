import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { entity_status_enum } from '@prisma/client';

export class CreateProductsDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsUUID()
  culture_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  default_unit?: string;

  @IsOptional()
  @IsEnum(entity_status_enum)
  status?: entity_status_enum;
}

export class UpdateProductsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsUUID()
  culture_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  default_unit?: string;

  @IsOptional()
  @IsEnum(entity_status_enum)
  status?: entity_status_enum;
}