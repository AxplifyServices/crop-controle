import { Allow, IsOptional } from 'class-validator';

export class CreateProductsDto {
  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  culture?: any;

  @IsOptional()
  @Allow()
  description?: any;

  @IsOptional()
  @Allow()
  default_unit?: any;

  @IsOptional()
  @Allow()
  status?: any;
}

export class UpdateProductsDto {
  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  culture?: any;

  @IsOptional()
  @Allow()
  description?: any;

  @IsOptional()
  @Allow()
  default_unit?: any;

  @IsOptional()
  @Allow()
  status?: any;
}
