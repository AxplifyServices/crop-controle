import { Allow, IsOptional } from 'class-validator';

export class CreateFactoriesDto {
  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

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
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;

  @IsOptional()
  @Allow()
  daily_capacity_kg?: any;

  @IsOptional()
  @Allow()
  responsible_id?: any;

  @IsOptional()
  @Allow()
  status?: any;
}

export class UpdateFactoriesDto {
  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

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
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;

  @IsOptional()
  @Allow()
  daily_capacity_kg?: any;

  @IsOptional()
  @Allow()
  responsible_id?: any;

  @IsOptional()
  @Allow()
  status?: any;
}
