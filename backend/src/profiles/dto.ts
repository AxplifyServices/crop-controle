import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const allowedScopeTypes = ['GROUP', 'COMPANY', 'FARM', 'FACTORY', 'STATION'];

export class ProfilePermissionDto {
  @IsString()
  module: string;

  @IsString()
  action: string;
}

export class ProfileScopeDto {
  @IsIn(allowedScopeTypes)
  entityType: string;

  @IsUUID()
  entityId: string;
}

export class CreateProfileDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsOptional()
  @IsIn(allowedScopeTypes)
  assignmentType?: string;

  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfilePermissionDto)
  permissions: ProfilePermissionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileScopeDto)
  scopes: ProfileScopeDto[];
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status?: string;

  @IsOptional()
  @IsIn(allowedScopeTypes)
  assignmentType?: string;

  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfilePermissionDto)
  permissions?: ProfilePermissionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileScopeDto)
  scopes?: ProfileScopeDto[];
}