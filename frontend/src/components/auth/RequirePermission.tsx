'use client';

import {useEffect, useState} from 'react';
import {useRouter} from '@/i18n/navigation';
import {fetchMe, getToken, getUser, updateStoredUser, type AuthUser} from '@/lib/auth';
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
    async function init() {
      const token = getToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const storedUser = getUser();

      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const freshUser = await fetchMe();
        updateStoredUser(freshUser);
        setUser(freshUser);
      } catch {
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    }

    init();
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