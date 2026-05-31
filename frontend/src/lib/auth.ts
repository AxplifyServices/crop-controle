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
  refreshToken: string;
  user: AuthUser;
};

export type RefreshResponse = {
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

export async function refreshSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token absent');
  }

  const data = await apiFetch<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({refreshToken})
  });

  localStorage.setItem('agri_control_token', data.accessToken);
  localStorage.setItem('agri_control_user', JSON.stringify(data.user));

  return data;
}

export function saveSession(data: LoginResponse) {
  localStorage.setItem('agri_control_token', data.accessToken);
  localStorage.setItem('agri_control_refresh_token', data.refreshToken);
  localStorage.setItem('agri_control_user', JSON.stringify(data.user));
}

export function updateStoredUser(user: AuthUser) {
  localStorage.setItem('agri_control_user', JSON.stringify(user));
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_token');
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_refresh_token');
}

export function clearSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('agri_control_token');
  localStorage.removeItem('agri_control_refresh_token');
  localStorage.removeItem('agri_control_user');
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

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({refreshToken})
    });
  } catch {
    // On supprime quand même la session locale.
  }

  clearSession();
}