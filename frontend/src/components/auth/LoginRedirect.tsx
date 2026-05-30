'use client';

import {useEffect} from 'react';
import {useRouter} from '@/i18n/navigation';
import {getToken} from '@/lib/auth';

export function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  return null;
}