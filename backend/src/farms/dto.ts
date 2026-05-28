import { Allow, IsOptional } from 'class-validator';

export class CreateFarmsDto {
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
  category?: any;

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
  surface_ha?: any;

  @IsOptional()
  @Allow()
  rent_monthly?: any;

  @IsOptional()
  @Allow()
  responsible_id?: any;

  @IsOptional()
  @Allow()
  status?: any;
}

export class UpdateFarmsDto {
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
  category?: any;

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
  surface_ha?: any;

  @IsOptional()
  @Allow()
  rent_monthly?: any;

  @IsOptional()
  @Allow()
  responsible_id?: any;

  @IsOptional()
  @Allow()
  status?: any;
}
