import { Allow, IsOptional } from 'class-validator';

export class CreatePlotsDto {
  @IsOptional()
  @Allow()
  farm_id?: any;

  @IsOptional()
  @Allow()
  culture_id?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  surface_ha?: any;

  @IsOptional()
  @Allow()
  status?: any;

  @IsOptional()
  @Allow()
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;
}

export class UpdatePlotsDto {
  @IsOptional()
  @Allow()
  farm_id?: any;

  @IsOptional()
  @Allow()
  culture_id?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  surface_ha?: any;

  @IsOptional()
  @Allow()
  status?: any;

  @IsOptional()
  @Allow()
  latitude?: any;

  @IsOptional()
  @Allow()
  longitude?: any;
}