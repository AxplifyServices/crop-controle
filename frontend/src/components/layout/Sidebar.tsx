'use client';

import {useEffect, useMemo, useState} from 'react';
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
  Users,
  X
} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {getUser, type AuthUser} from '@/lib/auth';
import {hasAnyPermission, hasPermission} from '@/lib/permissions';

type MenuItem = {
  key: string;
  href: string;
  module: string;
};

type MenuGroup = {
  key: string;
  icon: React.ComponentType<{size?: number; className?: string}>;
  href?: string;
  module?: string;
  items?: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    key: 'dashboard',
    icon: BarChart3,
    href: '/dashboard',
    module: 'dashboards'
  },
  {
    key: 'referential',
    icon: Building2,
    items: [
      {key: 'groups', href: '/referentiel/groups', module: 'groups'},
      {key: 'companies', href: '/referentiel/companies', module: 'companies'},
      {key: 'farms', href: '/referentiel/farms', module: 'farms'},
      {key: 'plots', href: '/referentiel/plots', module: 'plots'},
      {key: 'factories', href: '/referentiel/factories', module: 'factories'},
      {key: 'stations', href: '/referentiel/stations', module: 'stations'},
      {key: 'products', href: '/referentiel/products', module: 'products'},
      {
        key: 'productVarieties',
        href: '/referentiel/product-varieties',
        module: 'product-varieties'
      },
      {key: 'vehicles', href: '/referentiel/vehicles', module: 'vehicles'},
      {key: 'personnel', href: '/referentiel/personnel', module: 'personnel'}
    ]
  },
  {
    key: 'agriculture',
    icon: Sprout,
    items: [
      {key: 'projects', href: '/dashboard', module: 'agricultural-projects'},
      {key: 'plantations', href: '/dashboard', module: 'plantations'},
      {key: 'harvests', href: '/dashboard', module: 'harvests'},
      {key: 'charges', href: '/dashboard', module: 'charges'}
    ]
  },
  {
    key: 'factoryFlow',
    icon: Factory,
    items: [
      {key: 'shipments', href: '/dashboard', module: 'shipments'},
      {key: 'receptions', href: '/dashboard', module: 'receptions'},
      {key: 'conditioning', href: '/dashboard', module: 'conditioning'}
    ]
  },
  {
    key: 'commercial',
    icon: Package,
    items: [
      {key: 'clients', href: '/dashboard', module: 'clients'},
      {key: 'orders', href: '/dashboard', module: 'orders'},
      {key: 'invoices', href: '/dashboard', module: 'invoices'},
      {key: 'payments', href: '/dashboard', module: 'payments'}
    ]
  },
  {
    key: 'logistics',
    icon: Truck,
    href: '/dashboard',
    module: 'transports'
  },
  {
    key: 'reports',
    icon: FileText,
    href: '/dashboard',
    module: 'reports'
  },
  {
    key: 'admin',
    icon: Users,
    items: [
      {key: 'users', href: '/dashboard', module: 'users'},
      {key: 'roles', href: '/dashboard', module: 'roles'},
      {key: 'settings', href: '/dashboard', module: 'permissions'}
    ]
  }
];

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <DesktopSidebar collapsed={collapsed} />

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-slate-950/40"
            onClick={onCloseMobile}
          />

          <div className="absolute left-0 top-0 h-full w-[310px] max-w-[86vw] bg-white shadow-xl">
            <SidebarContent
              collapsed={false}
              mobile
              onCloseMobile={onCloseMobile}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function DesktopSidebar({collapsed}: {collapsed: boolean}) {
  return (
    <aside
      className={`hidden h-screen shrink-0 overflow-y-auto border-r border-slate-200 bg-white transition-all duration-300 lg:block ${
        collapsed ? 'w-[82px]' : 'w-[270px]'
      }`}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}

function SidebarContent({
  collapsed,
  mobile = false,
  onCloseMobile
}: {
  collapsed: boolean;
  mobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const t = useTranslations('Navigation');
  const tApp = useTranslations('App');
  const tCommon = useTranslations('Common');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const visibleMenuGroups = useMemo(() => {
    return menuGroups
      .map((group) => {
        if (group.items?.length) {
          const visibleItems = group.items.filter((item) =>
            hasPermission(user, item.module, 'VIEW')
          );

          return {
            ...group,
            items: visibleItems
          };
        }

        return group;
      })
      .filter((group) => {
        if (group.items?.length) {
          return hasAnyPermission(
            user,
            group.items.map((item) => item.module),
            'VIEW'
          );
        }

        if (group.module) {
          return hasPermission(user, group.module, 'VIEW');
        }

        return true;
      });
  }, [user]);

  return (
    <div className="h-full overflow-y-auto px-3 py-3">
      <div
        className={`mb-7 flex items-center rounded-xl bg-emerald-50 px-3 py-3 ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
          <Leaf size={21} />
        </div>

        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-semibold leading-tight text-emerald-900">
              {tApp('name')}
            </div>
            <div className="truncate text-[12px] font-medium text-slate-500">
              CropControle
            </div>
          </div>
        ) : null}

        {mobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900"
            aria-label={tCommon('closeMenu')}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="mb-3 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {tCommon('menu')}
        </div>
      ) : null}

      <nav className="space-y-1">
        {visibleMenuGroups.map((group) => (
          <SidebarGroup
            key={group.key}
            group={group}
            label={t(group.key)}
            collapsed={collapsed}
            onNavigate={mobile ? onCloseMobile : undefined}
          />
        ))}
      </nav>
    </div>
  );
}

function SidebarGroup({
  group,
  label,
  collapsed,
  onNavigate
}: {
  group: MenuGroup;
  label: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  const Icon = group.icon;
  const hasChildren = Boolean(group.items?.length);
  const activeByHref = group.href ? pathname === group.href : false;

  const activeByChildren =
    group.items?.some((item) => item.href !== '/dashboard' && pathname === item.href) ||
    false;

  const [open, setOpen] = useState(false);

  if (!hasChildren && group.href) {
    return (
      <Link
        href={group.href}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className={`flex h-11 items-center rounded-xl text-[14px] font-medium transition ${
          collapsed ? 'justify-center px-0' : 'gap-3 px-3'
        } ${
            activeByHref
              ? 'bg-slate-50 text-slate-900'
              : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
          activeByChildren
            ? 'bg-slate-50 text-slate-900'
            : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
            {group.items?.map((item) => {
              const active = item.href !== '/dashboard' && pathname === item.href;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  className={`block rounded-lg px-2 py-1.5 text-[14px] transition ${
                    active
                      ? 'bg-slate-100 font-medium text-slate-950'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}