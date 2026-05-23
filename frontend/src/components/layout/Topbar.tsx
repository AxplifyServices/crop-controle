'use client';

import {Bell, ChevronLeft, ChevronRight, LogOut} from 'lucide-react';
import {useRouter} from '@/i18n/navigation';
import {logout} from '@/lib/auth';
import {LanguageSwitcher} from './LanguageSwitcher';

export function Topbar({
  sidebarCollapsed,
  onToggleSidebar
}: {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const ToggleIcon = sidebarCollapsed ? ChevronRight : ChevronLeft;
  const toggleLabel = sidebarCollapsed ? 'Ouvrir le menu' : 'Fermer le menu';

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-7">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={toggleLabel}
          title={toggleLabel}
          className="flex h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 text-[13px] font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
        >
          <ToggleIcon size={18} />
          <span className="hidden sm:inline">Menu</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            0
          </span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          title="Déconnexion"
          aria-label="Déconnexion"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-emerald-700"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}