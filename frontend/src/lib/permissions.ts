import type {AuthUser} from './auth';

export type PermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VALIDATE'
  | 'EXPORT'
  | 'ADMIN';

export function hasPermission(
  user: AuthUser | null,
  module: string,
  action: PermissionAction = 'VIEW'
) {
  if (!user) return false;

  if (user.role?.name === 'super_admin') {
    return true;
  }

  return Boolean(
    user.permissions?.some(
      (permission) =>
        permission.module === module &&
        (permission.action === action || permission.action === 'ADMIN')
    )
  );
}

export function hasAnyPermission(
  user: AuthUser | null,
  modules: string[],
  action: PermissionAction = 'VIEW'
) {
  return modules.some((module) => hasPermission(user, module, action));
}