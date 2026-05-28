export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getClientToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_control_token');
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getClientToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'API error');
  }

  return data as T;
}