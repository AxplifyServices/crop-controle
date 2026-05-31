'use client';

import {useEffect, useState} from 'react';
import {useRouter} from '@/i18n/navigation';
import {
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
          router.push('/login');
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
        router.push('/login');
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
        Chargement des accès...
      </div>
    );
  }

  if (!hasPermission(user, module, action)) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Accès refusé</h1>
        <p className="mt-2 text-sm text-red-700">
          Votre profil ne dispose pas de la permission nécessaire pour accéder à ce module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}