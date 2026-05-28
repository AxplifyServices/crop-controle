import { Allow, IsOptional } from 'class-validator';

export class CreateGroupsDto {
  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  description?: any;
}

export class UpdateGroupsDto {
  @IsOptional()
  @Allow()
  name?: any;

  @IsOptional()
  @Allow()
  description?: any;
}
