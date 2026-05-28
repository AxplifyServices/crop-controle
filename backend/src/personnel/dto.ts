import { Allow, IsOptional } from 'class-validator';

export class CreatePersonnelDto {
  @IsOptional()
  @Allow()
  user_id?: any;

  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  farm_id?: any;

  @IsOptional()
  @Allow()
  factory_id?: any;

  @IsOptional()
  @Allow()
  station_id?: any;

  @IsOptional()
  @Allow()
  full_name?: any;

  @IsOptional()
  @Allow()
  grade?: any;

  @IsOptional()
  @Allow()
  contract_type?: any;

  @IsOptional()
  @Allow()
  salary?: any;

  @IsOptional()
  @Allow()
  status?: any;
}

export class UpdatePersonnelDto {
  @IsOptional()
  @Allow()
  user_id?: any;

  @IsOptional()
  @Allow()
  company_id?: any;

  @IsOptional()
  @Allow()
  farm_id?: any;

  @IsOptional()
  @Allow()
  factory_id?: any;

  @IsOptional()
  @Allow()
  station_id?: any;

  @IsOptional()
  @Allow()
  full_name?: any;

  @IsOptional()
  @Allow()
  grade?: any;

  @IsOptional()
  @Allow()
  contract_type?: any;

  @IsOptional()
  @Allow()
  salary?: any;

  @IsOptional()
  @Allow()
  status?: any;
}
