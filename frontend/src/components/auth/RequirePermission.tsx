'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {
  clearSession,
  fetchMe,
  getRefreshToken,
  getToken,
  getUser,
  refreshSession,
  updateStoredUser,
  type AuthUser
} from '@/lib/auth';
import {hasPermission, type PermissionAction} from '@/lib/permissions';

type RequirePermissionProps = {
  module: string;
  action?: PermissionAction;
  children: React.ReactNode;
};

export function RequirePermission({
  module,
  action = 'VIEW',
  children
}: RequirePermissionProps) {
  const router = useRouter();
  const t = useTranslations('Access');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        let token = getToken();

        if (!token && getRefreshToken()) {
          const refreshed = await refreshSession();
          token = refreshed.accessToken;
        }

        if (!token) {
          clearSession();
          router.replace('/login');
          return;
        }

        const storedUser = getUser();

        if (storedUser && mounted) {
          setUser(storedUser);
        }

        const freshUser = await fetchMe();

        updateStoredUser(freshUser);

        if (mounted) {
          setUser(freshUser);
        }
      } catch {
        clearSession();
        router.replace('/login');
        return;
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        {t('loading')}
      </div>
    );
  }

  if (!hasPermission(user, module, action)) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          {t('deniedTitle')}
        </h1>

        <p className="mt-2 text-sm text-red-700">
          {t('deniedDescription')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}