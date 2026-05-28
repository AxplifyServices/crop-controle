import { Allow, IsOptional } from 'class-validator';

export class CreateStationsDto {
  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  factory_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  daily_capacity_kg?: any;

  @IsOptional()
  @Allow()
  location?: any;

  @IsOptional()
  @Allow()
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;

  @IsOptional()
  @Allow()
  status?: any;
}

export class UpdateStationsDto {
  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  factory_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  daily_capacity_kg?: any;

  @IsOptional()
  @Allow()
  location?: any;

  @IsOptional()
  @Allow()
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;

  @IsOptional()
  @Allow()
  status?: any;
}
