import { Allow, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCulturesDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

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

export class UpdateCulturesDto {
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