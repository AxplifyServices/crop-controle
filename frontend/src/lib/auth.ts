import {apiFetch} from './api';

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    role: {
      id: string;
      name: string;
      description?: string | null;
    };
  };
};

export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password})
  });
}

export function saveSession(data: LoginResponse) {
  localStorage.setItem('agri_control_token', data.accessToken);
  localStorage.setItem('agri_control_user', JSON.stringify(data.user));
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;

  const rawUser = localStorage.getItem('agri_control_user');

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('agri_control_token');
  localStorage.removeItem('agri_control_user');
}