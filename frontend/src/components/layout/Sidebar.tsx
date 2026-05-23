'use client';

import {useState} from 'react';
import {
  BarChart3,
  Building2,
  ChevronRight,
  Factory,
  FileText,
  Leaf,
  Package,
  Sprout,
  Truck,
  Users
} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';

type MenuItem = {
  key: string;
  href: string;
};

type MenuGroup = {
  key: string;
  icon: React.ComponentType<{size?: number; className?: string}>;
  href?: string;
  items?: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    key: 'dashboard',
    icon: BarChart3,
    href: '/dashboard'
  },
  {
    key: 'referential',
    icon: Building2,
    items: [
      {key: 'groups', href: '/dashboard'},
      {key: 'companies', href: '/dashboard'},
      {key: 'farms', href: '/dashboard'},
      {key: 'plots', href: '/dashboard'},
      {key: 'factories', href: '/dashboard'},
      {key: 'products', href: '/dashboard'}
    ]
  },
  {
    key: 'agriculture',
    icon: Sprout,
    items: [
      {key: 'projects', href: '/dashboard'},
      {key: 'plantations', href: '/dashboard'},
      {key: 'harvests', href: '/dashboard'},
      {key: 'charges', href: '/dashboard'}
    ]
  },
  {
    key: 'factoryFlow',
    icon: Factory,
    items: [
      {key: 'shipments', href: '/dashboard'},
      {key: 'receptions', href: '/dashboard'},
      {key: 'conditioning', href: '/dashboard'}
    ]
  },
  {
    key: 'commercial',
    icon: Package,
    items: [
      {key: 'clients', href: '/dashboard'},
      {key: 'orders', href: '/dashboard'},
      {key: 'invoices', href: '/dashboard'},
      {key: 'payments', href: '/dashboard'}
    ]
  },
  {
    key: 'logistics',
    icon: Truck,
    href: '/dashboard'
  },
  {
    key: 'reports',
    icon: FileText,
    href: '/dashboard'
  },
  {
    key: 'admin',
    icon: Users,
    items: [
      {key: 'users', href: '/dashboard'},
      {key: 'roles', href: '/dashboard'},
      {key: 'settings', href: '/dashboard'}
    ]
  }
];

export function Sidebar({collapsed}: {collapsed: boolean}) {
  const t = useTranslations('Navigation');
  const tApp = useTranslations('App');

  return (
    <aside
      className={`hidden h-screen shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 py-3 transition-all duration-300 lg:block ${
        collapsed ? 'w-[82px]' : 'w-[270px]'
      }`}
    >
      <div
        className={`mb-7 flex items-center rounded-xl bg-emerald-50 px-3 py-3 ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
          <Leaf size={21} />
        </div>

        {!collapsed ? (
          <div className="min-w-0">
            <div className="truncate text-[17px] font-semibold leading-tight text-emerald-900">
              {tApp('name')}
            </div>
            <div className="truncate text-[12px] font-medium text-slate-500">
              CropControle
            </div>
          </div>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="mb-3 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Menu
        </div>
      ) : null}

      <nav className="space-y-1">
        {menuGroups.map((group) => (
          <SidebarGroup
            key={group.key}
            group={group}
            label={t(group.key)}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarGroup({
  group,
  label,
  collapsed
}: {
  group: MenuGroup;
  label: string;
  collapsed: boolean;
}) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  const Icon = group.icon;
  const hasChildren = Boolean(group.items?.length);
  const isDashboardActive = group.key === 'dashboard' && pathname === '/dashboard';

  const [open, setOpen] = useState(false);

  if (!hasChildren && group.href) {
    return (
      <Link
        href={group.href}
        title={collapsed ? label : undefined}
        className={`flex h-11 items-center rounded-xl text-[14px] font-medium transition ${
          collapsed ? 'justify-center px-0' : 'gap-3 px-3'
        } ${
          isDashboardActive
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
        }`}
      >
        <Icon size={18} />
        {!collapsed ? <span className="truncate">{label}</span> : null}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        title={collapsed ? label : undefined}
        onClick={() => {
          if (!collapsed) {
            setOpen((value) => !value);
          }
        }}
        className={`flex h-11 w-full items-center rounded-xl text-left text-[14px] font-medium transition ${
          collapsed ? 'justify-center px-0' : 'gap-3 px-3'
        } ${
          open
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
        }`}
      >
        <Icon size={18} />

        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate">{label}</span>

            <ChevronRight
              size={16}
              className={`shrink-0 transition-transform ${
                open ? 'rotate-90' : ''
              }`}
            />
          </>
        ) : null}
      </button>

      {!collapsed && open ? (
        <div className="ml-[21px] border-l border-slate-200 py-1 pl-5">
          <div className="space-y-1">
            {group.items?.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block rounded-lg px-2 py-1.5 text-[14px] text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}