export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getClientToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_token');
}

function getClientRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_refresh_token');
}

function clearClientSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('agri_control_token');
  localStorage.removeItem('agri_control_refresh_token');
  localStorage.removeItem('agri_control_user');
}

function shouldAttemptRefresh(path: string) {
  return !['/auth/login', '/auth/refresh', '/auth/logout'].includes(path);
}

async function refreshAccessToken() {
  const refreshToken = getClientRefreshToken();

  if (!refreshToken) {
    throw new Error('Session expirée');
  }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({refreshToken})
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    clearClientSession();
    throw new Error(data?.message || 'Session expirée');
  }

  localStorage.setItem('agri_control_token', data.accessToken);
  localStorage.setItem('agri_control_user', JSON.stringify(data.user));

  return data.accessToken as string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getClientToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 && retry && shouldAttemptRefresh(path)) {
    const newToken = await refreshAccessToken();

    return apiFetch<T>(
      path,
      {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`
        }
      },
      false
    );
  }

  if (!res.ok) {
    throw new Error(data?.message || 'API error');
  }

  return data as T;
}