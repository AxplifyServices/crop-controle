import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';

export type PermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VALIDATE'
  | 'EXPORT'
  | 'ADMIN';

export type RequiredPermission = {
  module: string;
  action: PermissionAction;
};

export const RequirePermission = (module: string, action: PermissionAction) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, { module, action });