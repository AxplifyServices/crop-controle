'use client';

import {useState} from 'react';
import {Sidebar} from './Sidebar';
import {Topbar} from './Topbar';

export function AppShell({children}: {children: React.ReactNode}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#eef2f6]">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="min-w-0 flex-1">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        />
        <main className="p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}