import { Allow, IsOptional } from 'class-validator';

export class CreateCompaniesDto {
  @IsOptional()
  @Allow()
  group_id?: any;

  @IsOptional()
  @Allow()
  parent_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  legal_name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  ice?: any;

  @IsOptional()
  @Allow()
  tax_id?: any;

  @IsOptional()
  @Allow()
  rc?: any;

  @IsOptional()
  @Allow()
  cnss?: any;

  @IsOptional()
  @Allow()
  patente?: any;

  @IsOptional()
  @Allow()
  address?: any;

  @IsOptional()
  @Allow()
  city?: any;

  @IsOptional()
  @Allow()
  region?: any;

  @IsOptional()
  @Allow()
  country?: any;

  @IsOptional()
  @Allow()
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;

  @IsOptional()
  @Allow()
  responsible_id?: any;

  @IsOptional()
  @Allow()
  status?: any;

  @IsOptional()
  @Allow()
  country_id?: any;

  @IsOptional()
  @Allow()
  region_id?: any;

  @IsOptional()
  @Allow()
  city_id?: any;

  @IsOptional()
  @Allow()
  legal_identifiers?: any;
}

export class UpdateCompaniesDto {
  @IsOptional()
  @Allow()
  group_id?: any;

  @IsOptional()
  @Allow()
  parent_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  legal_name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  ice?: any;

  @IsOptional()
  @Allow()
  tax_id?: any;

  @IsOptional()
  @Allow()
  rc?: any;

  @IsOptional()
  @Allow()
  cnss?: any;

  @IsOptional()
  @Allow()
  patente?: any;

  @IsOptional()
  @Allow()
  address?: any;

  @IsOptional()
  @Allow()
  city?: any;

  @IsOptional()
  @Allow()
  region?: any;

  @IsOptional()
  @Allow()
  country?: any;

  @IsOptional()
  @Allow()
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;

  @IsOptional()
  @Allow()
  responsible_id?: any;

  @IsOptional()
  @Allow()
  status?: any;

  @IsOptional()
  @Allow()
  country_id?: any;

  @IsOptional()
  @Allow()
  region_id?: any;

  @IsOptional()
  @Allow()
  city_id?: any;

  @IsOptional()
  @Allow()
  legal_identifiers?: any;
}
