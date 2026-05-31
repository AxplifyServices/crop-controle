export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getClientToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_token');
}

function getClientRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_refresh_token');
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

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 && retry && path !== '/auth/refresh') {
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