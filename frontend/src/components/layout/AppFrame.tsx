'use client';

import {usePathname} from '@/i18n/navigation';
import {AppShell} from './AppShell';

export function AppFrame({children}: {children: React.ReactNode}) {
  const pathname = usePathname();

  const isPublicPage = pathname === '/login';

  if (isPublicPage) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}