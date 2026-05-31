'use client';

import {useEffect} from 'react';
import {useRouter} from '@/i18n/navigation';
import {getRefreshToken, getToken, refreshSession} from '@/lib/auth';

export function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function init() {
      const token = getToken();

      if (token) {
        router.replace('/dashboard');
        return;
      }

      if (!getRefreshToken()) {
        return;
      }

      try {
        await refreshSession();

        if (mounted) {
          router.replace('/dashboard');
        }
      } catch {
        // Session absente ou expirée : on laisse l'utilisateur sur login.
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}