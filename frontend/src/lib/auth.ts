import {apiFetch} from './api';

export type Permission = {
  module: string;
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE' | 'EXPORT' | 'ADMIN';
};

export type UserScope = {
  id: string;
  entityType: string;
  entityId: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  title?: string | null;
  jobTitle?: string | null;
  assignmentType?: string | null;
  assignmentId?: string | null;
  managerId?: string | null;
  status: string;
  role: {
    id: string;
    name: string;
    description?: string | null;
  };
  permissions?: Permission[];
  scopes?: UserScope[];
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password})
  });
}

export async function fetchMe() {
  return apiFetch<AuthUser>('/auth/me');
}

export function saveSession(data: LoginResponse) {
  localStorage.setItem('agri_control_token', data.accessToken);
  localStorage.setItem('agri_control_user', JSON.stringify(data.user));
}

export function updateStoredUser(user: AuthUser) {
  localStorage.setItem('agri_control_user', JSON.stringify(user));
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_token');
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const rawUser = localStorage.getItem('agri_control_user');

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('agri_control_token');
  localStorage.removeItem('agri_control_user');
}