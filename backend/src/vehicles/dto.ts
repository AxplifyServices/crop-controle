import { Allow, IsOptional } from 'class-validator';

export class CreateVehiclesDto {
  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  type?: any;

  @IsOptional()
  @Allow()
  brand?: any;

  @IsOptional()
  @Allow()
  model?: any;

  @IsOptional()
  @Allow()
  registration_number?: any;

  @IsOptional()
  @Allow()
  acquisition_mode?: any;

  @IsOptional()
  @Allow()
  rent_monthly?: any;

  @IsOptional()
  @Allow()
  capacity_kg?: any;

  @IsOptional()
  @Allow()
  status?: any;
}

export class UpdateVehiclesDto {
  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  type?: any;

  @IsOptional()
  @Allow()
  brand?: any;

  @IsOptional()
  @Allow()
  model?: any;

  @IsOptional()
  @Allow()
  registration_number?: any;

  @IsOptional()
  @Allow()
  acquisition_mode?: any;

  @IsOptional()
  @Allow()
  rent_monthly?: any;

  @IsOptional()
  @Allow()
  capacity_kg?: any;

  @IsOptional()
  @Allow()
  status?: any;
}
