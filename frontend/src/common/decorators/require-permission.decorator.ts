import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';

export type RequiredPermission = {
  module: string;
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE' | 'EXPORT' | 'ADMIN';
};

export const RequirePermission = (
  module: string,
  action: RequiredPermission['action'],
) => SetMetadata(REQUIRED_PERMISSION_KEY, { module, action });