import { Allow, IsOptional } from 'class-validator';

export class CreateProductVarietiesDto {
  @IsOptional()
  @Allow()
  product_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  description?: any;

  @IsOptional()
  @Allow()
  status?: any;
}

export class UpdateProductVarietiesDto {
  @IsOptional()
  @Allow()
  product_id?: any;

  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  code?: any;

  @IsOptional()
  @Allow()
  description?: any;

  @IsOptional()
  @Allow()
  status?: any;
}
