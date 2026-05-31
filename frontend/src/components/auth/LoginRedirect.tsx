'use client';

import {useEffect} from 'react';
import {useRouter} from '@/i18n/navigation';
import {
  clearSession,
  fetchMe,
  getRefreshToken,
  getToken,
  refreshSession,
  updateStoredUser
} from '@/lib/auth';

export function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const token = getToken();
        const refreshToken = getRefreshToken();

        if (!token && !refreshToken) {
          clearSession();
          return;
        }

        if (!token && refreshToken) {
          await refreshSession();

          if (mounted) {
            router.replace('/dashboard');
          }

          return;
        }

        const user = await fetchMe();
        updateStoredUser(user);

        if (mounted) {
          router.replace('/dashboard');
        }
      } catch {
        clearSession();
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}