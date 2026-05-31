'use client';

import {useEffect, useMemo, useState, type FormEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {
  Edit3,
  Lock,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';
import {apiFetch} from '@/lib/api';
import {getUser, type AuthUser} from '@/lib/auth';
import {hasPermission} from '@/lib/permissions';
import {RequirePermission} from '@/components/auth/RequirePermission';
import {
  MultiSelectDropdown,
  type MultiSelectOption
} from '@/components/ui/MultiSelectDropdown';

type Permission = {
  id?: string;
  module: string;
  action: string;
  description?: string | null;
};

type ManagerOption = {
  id: string;
  label: string;
};

type ScopeOption = {
  id: string;
  label: string;
};

type ProfilesMeta = {
  permissions: Permission[];
  managers: ManagerOption[];
  scopeTargets: Record<string, ScopeOption[]>;
};

type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  title?: string | null;
  jobTitle?: string | null;
  status: string;
  isLocked?: boolean;
  assignmentType?: string | null;
  assignmentId?: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  role?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  permissions: Permission[];
  scopes: {
    id: string;
    entityType: string;
    entityId: string;
  }[];
};

type FormState = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  title: string;
  jobTitle: string;
  managerId: string;
  assignmentType: string;
  assignmentId: string;
  permissions: string[];
  scopes: string[];
};

const emptyForm: FormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  title: '',
  jobTitle: '',
  managerId: '',
  assignmentType: '',
  assignmentId: '',
  permissions: [],
  scopes: []
};

type SupportedLocale = 'fr' | 'en' | 'es';

const MODULE_LABELS: Record<SupportedLocale, Record<string, string>> = {
  fr: {
    auth: 'Authentification',
    users: 'Utilisateurs',
    roles: 'Rôles',
    permissions: 'Permissions',
    profiles: 'Gestion des profils',
    'audit-logs': 'Historique des actions',
    groups: 'Groupes',
    companies: 'Entreprises',
    farms: 'Fermes',
    plots: 'Parcelles',
    factories: 'Usines',
    stations: 'Stations / UC',
    personnel: 'Personnel',
    vehicles: 'Véhicules',
    products: 'Produits',
    'product-varieties': 'Variétés produits',
    cultures: 'Cultures',
    geography: 'Géographie',
    'legal-identifier-types': 'Types d’identifiants légaux',
    'agricultural-projects': 'Projets agricoles',
    plantations: 'Plantations',
    treatments: 'Traitements',
    harvests: 'Récoltes',
    productions: 'Productions',
    charges: 'Charges',
    shipments: 'Expéditions ferme-usine',
    receptions: 'Réceptions usine',
    conditioning: 'Conditionnement',
    alerts: 'Alertes',
    dashboard: 'Tableau de bord',
    dashboards: 'Tableaux de bord',
    reports: 'Reporting'
  },
  en: {
    auth: 'Authentication',
    users: 'Users',
    roles: 'Roles',
    permissions: 'Permissions',
    profiles: 'Profile management',
    'audit-logs': 'Action history',
    groups: 'Groups',
    companies: 'Companies',
    farms: 'Farms',
    plots: 'Plots',
    factories: 'Factories',
    stations: 'Stations / Units',
    personnel: 'Personnel',
    vehicles: 'Vehicles',
    products: 'Products',
    'product-varieties': 'Product varieties',
    cultures: 'Crops',
    geography: 'Geography',
    'legal-identifier-types': 'Legal identifier types',
    'agricultural-projects': 'Agricultural projects',
    plantations: 'Plantations',
    treatments: 'Treatments',
    harvests: 'Harvests',
    productions: 'Productions',
    charges: 'Costs',
    shipments: 'Farm-factory shipments',
    receptions: 'Factory receptions',
    conditioning: 'Packaging',
    alerts: 'Alerts',
    dashboard: 'Dashboard',
    dashboards: 'Dashboards',
    reports: 'Reports'
  },
  es: {
    auth: 'Autenticación',
    users: 'Usuarios',
    roles: 'Roles',
    permissions: 'Permisos',
    profiles: 'Gestión de perfiles',
    'audit-logs': 'Historial de acciones',
    groups: 'Grupos',
    companies: 'Empresas',
    farms: 'Fincas',
    plots: 'Parcelas',
    factories: 'Fábricas',
    stations: 'Estaciones / Unidades',
    personnel: 'Personal',
    vehicles: 'Vehículos',
    products: 'Productos',
    'product-varieties': 'Variedades de productos',
    cultures: 'Cultivos',
    geography: 'Geografía',
    'legal-identifier-types': 'Tipos de identificadores legales',
    'agricultural-projects': 'Proyectos agrícolas',
    plantations: 'Plantaciones',
    treatments: 'Tratamientos',
    harvests: 'Cosechas',
    productions: 'Producciones',
    charges: 'Costes',
    shipments: 'Envíos finca-fábrica',
    receptions: 'Recepciones fábrica',
    conditioning: 'Acondicionamiento',
    alerts: 'Alertas',
    dashboard: 'Panel de control',
    dashboards: 'Paneles de control',
    reports: 'Informes'
  }
};

const MODULE_GROUP_LABELS: Record<SupportedLocale, Record<string, string>> = {
  fr: {
    auth: 'Sécurité',
    users: 'Administration',
    roles: 'Administration',
    permissions: 'Administration',
    profiles: 'Administration',
    'audit-logs': 'Administration',
    groups: 'Référentiel',
    companies: 'Référentiel',
    farms: 'Référentiel',
    plots: 'Référentiel',
    factories: 'Référentiel',
    stations: 'Référentiel',
    personnel: 'Référentiel',
    vehicles: 'Référentiel',
    products: 'Référentiel',
    'product-varieties': 'Référentiel',
    cultures: 'Référentiel',
    geography: 'Référentiel',
    'legal-identifier-types': 'Référentiel',
    'agricultural-projects': 'Production agricole',
    plantations: 'Production agricole',
    treatments: 'Production agricole',
    harvests: 'Production agricole',
    productions: 'Production agricole',
    charges: 'Production agricole',
    shipments: 'Flux ferme-usine',
    receptions: 'Flux ferme-usine',
    conditioning: 'Flux ferme-usine',
    alerts: 'Pilotage',
    dashboard: 'Pilotage',
    dashboards: 'Pilotage',
    reports: 'Pilotage'
  },
  en: {
    auth: 'Security',
    users: 'Administration',
    roles: 'Administration',
    permissions: 'Administration',
    profiles: 'Administration',
    'audit-logs': 'Administration',
    groups: 'Reference data',
    companies: 'Reference data',
    farms: 'Reference data',
    plots: 'Reference data',
    factories: 'Reference data',
    stations: 'Reference data',
    personnel: 'Reference data',
    vehicles: 'Reference data',
    products: 'Reference data',
    'product-varieties': 'Reference data',
    cultures: 'Reference data',
    geography: 'Reference data',
    'legal-identifier-types': 'Reference data',
    'agricultural-projects': 'Agricultural production',
    plantations: 'Agricultural production',
    treatments: 'Agricultural production',
    harvests: 'Agricultural production',
    productions: 'Agricultural production',
    charges: 'Agricultural production',
    shipments: 'Farm-factory flow',
    receptions: 'Farm-factory flow',
    conditioning: 'Farm-factory flow',
    alerts: 'Management',
    dashboard: 'Management',
    dashboards: 'Management',
    reports: 'Management'
  },
  es: {
    auth: 'Seguridad',
    users: 'Administración',
    roles: 'Administración',
    permissions: 'Administración',
    profiles: 'Administración',
    'audit-logs': 'Administración',
    groups: 'Referencial',
    companies: 'Referencial',
    farms: 'Referencial',
    plots: 'Referencial',
    factories: 'Referencial',
    stations: 'Referencial',
    personnel: 'Referencial',
    vehicles: 'Referencial',
    products: 'Referencial',
    'product-varieties': 'Referencial',
    cultures: 'Referencial',
    geography: 'Referencial',
    'legal-identifier-types': 'Referencial',
    'agricultural-projects': 'Producción agrícola',
    plantations: 'Producción agrícola',
    treatments: 'Producción agrícola',
    harvests: 'Producción agrícola',
    productions: 'Producción agrícola',
    charges: 'Producción agrícola',
    shipments: 'Flujo finca-fábrica',
    receptions: 'Flujo finca-fábrica',
    conditioning: 'Flujo finca-fábrica',
    alerts: 'Pilotaje',
    dashboard: 'Pilotaje',
    dashboards: 'Pilotaje',
    reports: 'Pilotaje'
  }
};

const ACTION_LABELS: Record<SupportedLocale, Record<string, string>> = {
  fr: {
    VIEW: 'Consulter',
    CREATE: 'Créer',
    UPDATE: 'Modifier',
    DELETE: 'Supprimer',
    VALIDATE: 'Valider',
    EXPORT: 'Exporter',
    IMPORT: 'Importer',
    ADMIN: 'Administrer',
    MANAGE: 'Gérer',
    ASSIGN: 'Affecter',
    APPROVE: 'Approuver',
    REJECT: 'Rejeter',
    LOGIN: 'Connexion',
    LOGOUT: 'Déconnexion',
    REFRESH: 'Rafraîchir',
    READ: 'Lire',
    WRITE: 'Écrire',
    RESTORE: 'Restaurer',
    ARCHIVE: 'Archiver'
  },
  en: {
    VIEW: 'View',
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
    VALIDATE: 'Validate',
    EXPORT: 'Export',
    IMPORT: 'Import',
    ADMIN: 'Administer',
    MANAGE: 'Manage',
    ASSIGN: 'Assign',
    APPROVE: 'Approve',
    REJECT: 'Reject',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    REFRESH: 'Refresh',
    READ: 'Read',
    WRITE: 'Write',
    RESTORE: 'Restore',
    ARCHIVE: 'Archive'
  },
  es: {
    VIEW: 'Consultar',
    CREATE: 'Crear',
    UPDATE: 'Modificar',
    DELETE: 'Eliminar',
    VALIDATE: 'Validar',
    EXPORT: 'Exportar',
    IMPORT: 'Importar',
    ADMIN: 'Administrar',
    MANAGE: 'Gestionar',
    ASSIGN: 'Asignar',
    APPROVE: 'Aprobar',
    REJECT: 'Rechazar',
    LOGIN: 'Conexión',
    LOGOUT: 'Desconexión',
    REFRESH: 'Actualizar',
    READ: 'Leer',
    WRITE: 'Escribir',
    RESTORE: 'Restaurar',
    ARCHIVE: 'Archivar'
  }
};

function getSupportedLocale(locale: string): SupportedLocale {
  if (locale === 'en' || locale === 'es') {
    return locale;
  }

  return 'fr';
}

function humanizePermissionKey(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getLocalizedDictionaryValue(
  dictionary: Record<SupportedLocale, Record<string, string>>,
  locale: string,
  key: string,
  fallback?: string
) {
  const supportedLocale = getSupportedLocale(locale);

  return (
    dictionary[supportedLocale][key] ||
    dictionary.fr[key] ||
    fallback ||
    humanizePermissionKey(key)
  );
}

function normalizeApiRows<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const payload = data as Record<string, unknown>;

  if (Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  if (Array.isArray(payload.items)) {
    return payload.items as T[];
  }

  if (Array.isArray(payload.results)) {
    return payload.results as T[];
  }

  if (Array.isArray(payload.records)) {
    return payload.records as T[];
  }

  return [];
}

function normalizeApiObject<T>(data: unknown, fallback: T): T {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const payload = data as Record<string, unknown>;

  if (payload.data && typeof payload.data === 'object') {
    return payload.data as T;
  }

  return data as T;
}

function isSuperAdminRole(roleName?: string | null) {
  const normalized = String(roleName || '').toLowerCase();

  return ['super_admin', 'super-admin', 'superadmin'].includes(normalized);
}

function formatPermissionValue(permission: Permission) {
  return `${permission.module}.${permission.action}`;
}

function formatScopeValue(scope: {entityType: string; entityId: string}) {
  return `${scope.entityType}:${scope.entityId}`;
}

export default function ProfilesPage() {
  return (
    <RequirePermission module="profiles" action="VIEW">
      <ProfilesContent />
    </RequirePermission>
  );
}

function ProfilesContent() {
  const t = useTranslations('Profiles');

  const locale = useLocale();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [meta, setMeta] = useState<ProfilesMeta | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const scopeTypes = useMemo(
    () => [
      {value: 'GROUP', label: t('scopeTypes.group')},
      {value: 'COMPANY', label: t('scopeTypes.company')},
      {value: 'FARM', label: t('scopeTypes.farm')},
      {value: 'FACTORY', label: t('scopeTypes.factory')},
      {value: 'STATION', label: t('scopeTypes.station')}
    ],
    [t]
  );

  const canCreate = hasPermission(user, 'profiles', 'CREATE');
  const canUpdate = hasPermission(user, 'profiles', 'UPDATE');
  const canDelete = hasPermission(user, 'profiles', 'DELETE');

const permissionOptions = useMemo<MultiSelectOption[]>(() => {
  return (meta?.permissions || []).map((permission) => {
    const moduleLabel = getLocalizedDictionaryValue(
      MODULE_LABELS,
      locale,
      permission.module
    );

    const actionLabel = getLocalizedDictionaryValue(
      ACTION_LABELS,
      locale,
      permission.action
    );

    const groupLabel = getLocalizedDictionaryValue(
      MODULE_GROUP_LABELS,
      locale,
      permission.module,
      t('moduleGroups.other')
    );

    return {
      value: formatPermissionValue(permission),
      label: `${moduleLabel} — ${actionLabel}`,
      description: groupLabel,
      group: groupLabel
    };
  });
}, [locale, meta, t]);
  const scopeOptions = useMemo<MultiSelectOption[]>(() => {
    const options: MultiSelectOption[] = [];

    for (const scopeType of scopeTypes) {
      const items = meta?.scopeTargets?.[scopeType.value] || [];

      for (const item of items) {
        options.push({
          value: `${scopeType.value}:${item.id}`,
          label: item.label,
          description: scopeType.label,
          group: scopeType.label
        });
      }
    }

    return options;
  }, [meta, scopeTypes]);

  useEffect(() => {
    setUser(getUser());
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const profilesData = await apiFetch<unknown>('/profiles');
      const metaData = await apiFetch<unknown>('/profiles/meta');

      setProfiles(normalizeApiRows<Profile>(profilesData));
      setMeta(
        normalizeApiObject<ProfilesMeta>(metaData, {
          permissions: [],
          managers: [],
          scopeTargets: {}
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loading'));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setOpenForm(false);
  }

  function startCreate() {
    setError('');
    setForm(emptyForm);
    setEditingId(null);
    setOpenForm(true);
  }

  function isLockedProfile(profile: Profile) {
    if (profile.isLocked) {
      return true;
    }

    if (profile.id === user?.id) {
      return true;
    }

    return isSuperAdminRole(profile.role?.name);
  }

  function startEdit(profile: Profile) {
    if (isLockedProfile(profile)) {
      setError(t('errors.lockedProfile'));
      return;
    }

    setError('');
    setEditingId(profile.id);
    setOpenForm(true);

    setForm({
      email: profile.email,
      password: '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      title: profile.title || '',
      jobTitle: profile.jobTitle || '',
      managerId: profile.manager?.id || '',
      assignmentType: profile.assignmentType || '',
      assignmentId: profile.assignmentId || '',
      permissions: (profile.permissions || []).map(formatPermissionValue),
      scopes: (profile.scopes || []).map(formatScopeValue)
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError('');

    const permissions = form.permissions
      .map((permissionKey) => {
        const [module, action] = permissionKey.split('.');

        return {
          module,
          action
        };
      })
      .filter((permission) => permission.module && permission.action);

    const scopes = form.scopes
      .map((scopeKey) => {
        const [entityType, entityId] = scopeKey.split(':');

        return {
          entityType,
          entityId
        };
      })
      .filter((scope) => scope.entityType && scope.entityId);

    const payload: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || null,
      title: form.title || null,
      jobTitle: form.jobTitle || null,
      managerId: form.managerId || null,
      assignmentType: form.assignmentType || null,
      assignmentId: form.assignmentId || null,
      permissions,
      scopes
    };

    if (!editingId) {
      payload.email = form.email;
      payload.password = form.password;
    }

    try {
      if (editingId) {
        await apiFetch(`/profiles/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/profiles', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.saving'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile(profile: Profile) {
    if (isLockedProfile(profile)) {
      setError(t('errors.lockedProfile'));
      return;
    }

    const confirmed = window.confirm(
      t('confirmDelete', {
        firstName: profile.firstName,
        lastName: profile.lastName
      })
    );

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await apiFetch(`/profiles/${profile.id}`, {
        method: 'DELETE'
      });

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.deleting'));
    }
  }

function getStatusLabel(status: string) {
  const statusLabels: Record<string, Record<string, string>> = {
    fr: {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      ARCHIVED: 'Archivé',
      SUSPENDED: 'Suspendu'
    },
    en: {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      ARCHIVED: 'Archived',
      SUSPENDED: 'Suspended'
    },
    es: {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      ARCHIVED: 'Archivado',
      SUSPENDED: 'Suspendido'
    }
  };

  const currentLocale = getSupportedLocale(locale);
  const normalizedStatus = String(status || '').toUpperCase();

  return (
    statusLabels[currentLocale][normalizedStatus] ||
    statusLabels.fr[normalizedStatus] ||
    humanizePermissionKey(normalizedStatus || status)
  );
}
  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {t('section')}
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {t('title')}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              {t('refresh')}
            </button>

            {canCreate ? (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Plus size={16} />
                {t('newProfile')}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {openForm ? (
        <form
          onSubmit={saveProfile}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {editingId ? t('editTitle') : t('createTitle')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('formDescription')}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label={t('cancel')}
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {!editingId ? (
              <>
                <Field
                  label={t('fields.email')}
                  value={form.email}
                  onChange={(value) => setForm({...form, email: value})}
                  required
                />

                <Field
                  label={t('fields.password')}
                  type="password"
                  value={form.password}
                  onChange={(value) => setForm({...form, password: value})}
                  required
                />
              </>
            ) : null}

            <Field
              label={t('fields.lastName')}
              value={form.lastName}
              onChange={(value) => setForm({...form, lastName: value})}
              required
            />

            <Field
              label={t('fields.firstName')}
              value={form.firstName}
              onChange={(value) => setForm({...form, firstName: value})}
              required
            />

            <Field
              label={t('fields.phone')}
              value={form.phone}
              onChange={(value) => setForm({...form, phone: value})}
            />

            <Field
              label={t('fields.title')}
              placeholder={t('placeholders.title')}
              value={form.title}
              onChange={(value) => setForm({...form, title: value})}
            />

            <Field
              label={t('fields.jobTitle')}
              placeholder={t('placeholders.jobTitle')}
              value={form.jobTitle}
              onChange={(value) => setForm({...form, jobTitle: value})}
            />

            <SelectField
              label={t('fields.manager')}
              emptyLabel={t('fields.notProvided')}
              value={form.managerId}
              onChange={(value) => setForm({...form, managerId: value})}
              options={(meta?.managers || []).filter(
                (manager) => manager.id !== editingId
              )}
            />

            <SelectField
              label={t('fields.assignmentType')}
              emptyLabel={t('fields.notProvided')}
              value={form.assignmentType}
              onChange={(value) =>
                setForm({...form, assignmentType: value, assignmentId: ''})
              }
              options={scopeTypes.map((item) => ({
                id: item.value,
                label: item.label
              }))}
            />

            <SelectField
              label={t('fields.assignment')}
              emptyLabel={t('fields.notProvided')}
              value={form.assignmentId}
              onChange={(value) => setForm({...form, assignmentId: value})}
              options={
                form.assignmentType
                  ? meta?.scopeTargets?.[form.assignmentType] || []
                  : []
              }
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-slate-600" />

                <div>
                  <h3 className="font-semibold text-slate-950">
                    {t('permissionsTitle')}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {t('permissionsDescription')}
                  </p>
                </div>
              </div>

              <MultiSelectDropdown
                label={t('permissionsLabel')}
                placeholder={t('permissionsPlaceholder')}
                values={form.permissions}
                options={permissionOptions}
                onChange={(values) => setForm({...form, permissions: values})}
                emptyLabel={t('emptyPermissions')}
                searchPlaceholder={t('searchPlaceholder')}
                selectedCountLabel={(count) =>
                  t('selectedCount', {
                    count
                  })
                }
              />
            </section>

            <section className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-950">
                  {t('scopesTitle')}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {t('scopesDescription')}
                </p>
              </div>

              <MultiSelectDropdown
                label={t('scopesLabel')}
                placeholder={t('scopesPlaceholder')}
                values={form.scopes}
                options={scopeOptions}
                onChange={(values) => setForm({...form, scopes: values})}
                emptyLabel={t('emptyScopes')}
                searchPlaceholder={t('searchPlaceholder')}
                selectedCountLabel={(count) =>
                  t('selectedCount', {
                    count
                  })
                }
              />
            </section>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t('cancel')}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      ) : null}

<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-200 px-5 py-4">
    <h2 className="font-semibold text-slate-950">
      {t('existingProfiles')}
    </h2>
  </div>

  {loading ? (
    <div className="p-5 text-sm text-slate-500">
      {t('loading')}
    </div>
  ) : profiles.length === 0 ? (
    <div className="p-5 text-sm text-slate-500">
      {t('noProfiles')}
    </div>
  ) : (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">{t('table.profile')}</th>
              <th className="px-5 py-3">{t('table.titleJob')}</th>
              <th className="px-5 py-3">{t('table.manager')}</th>
              <th className="px-5 py-3">{t('table.permissions')}</th>
              <th className="px-5 py-3">{t('table.scopes')}</th>
              <th className="px-5 py-3">{t('table.status')}</th>
              <th className="px-5 py-3 text-right">
                {t('table.actions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {profiles.map((profile) => {
              const locked = isLockedProfile(profile);

              return (
                <tr key={profile.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium text-slate-950">
                          {profile.firstName} {profile.lastName}
                        </div>

                        <div className="text-xs text-slate-500">
                          {profile.email}
                        </div>
                      </div>

                      {locked ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                          title={t('lockedProfile')}
                        >
                          <Lock size={12} />
                          {t('locked')}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <div>{profile.title || '-'}</div>
                    <div className="text-xs text-slate-500">
                      {profile.jobTitle || '-'}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {profile.manager
                      ? `${profile.manager.firstName} ${profile.manager.lastName}`
                      : '-'}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {profile.permissions?.length || 0}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {profile.scopes?.length || 0}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {getStatusLabel(profile.status)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {canUpdate && !locked ? (
                        <button
                          type="button"
                          onClick={() => startEdit(profile)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-white hover:text-slate-950"
                          title={t('actions.edit')}
                        >
                          <Edit3 size={16} />
                        </button>
                      ) : null}

                      {canDelete && !locked ? (
                        <button
                          type="button"
                          onClick={() => deleteProfile(profile)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                          title={t('actions.delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 bg-slate-50/60 p-3 md:hidden">
        {profiles.map((profile) => {
          const locked = isLockedProfile(profile);

          return (
            <ProfileMobileCard
              key={profile.id}
              profile={profile}
              locked={locked}
              statusLabel={getStatusLabel(profile.status)}
              canUpdate={canUpdate}
              canDelete={canDelete}
              lockedLabel={t('locked')}
              lockedTitle={t('lockedProfile')}
              profileLabel={t('table.profile')}
              titleJobLabel={t('table.titleJob')}
              managerLabel={t('table.manager')}
              permissionsLabel={t('table.permissions')}
              scopesLabel={t('table.scopes')}
              editLabel={t('actions.edit')}
              deleteLabel={t('actions.delete')}
              onEdit={() => startEdit(profile)}
              onDelete={() => deleteProfile(profile)}
            />
          );
        })}
      </div>
    </>
  )}
</section>
    </main>
  );
}

function ProfileMobileCard({
  profile,
  locked,
  statusLabel,
  canUpdate,
  canDelete,
  lockedLabel,
  lockedTitle,
  profileLabel,
  titleJobLabel,
  managerLabel,
  permissionsLabel,
  scopesLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete
}: {
  profile: Profile;
  locked: boolean;
  statusLabel: string;
  canUpdate: boolean;
  canDelete: boolean;
  lockedLabel: string;
  lockedTitle: string;
  profileLabel: string;
  titleJobLabel: string;
  managerLabel: string;
  permissionsLabel: string;
  scopesLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const managerName = profile.manager
    ? `${profile.manager.firstName} ${profile.manager.lastName}`
    : '-';

  const titleJob = [profile.title, profile.jobTitle]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {profileLabel}
          </p>

          <h3 className="mt-1 truncate text-base font-semibold text-slate-950">
            {profile.firstName} {profile.lastName}
          </h3>

          <p className="mt-1 truncate text-sm text-slate-500">
            {profile.email}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {statusLabel}
        </span>
      </div>

      {locked ? (
        <div
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          title={lockedTitle}
        >
          <Lock size={12} />
          {lockedLabel}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2">
        <ProfileMobileInfo
          label={titleJobLabel}
          value={titleJob || '-'}
        />

        <ProfileMobileInfo
          label={managerLabel}
          value={managerName}
        />

        <div className="grid grid-cols-2 gap-2">
          <ProfileMobileInfo
            label={permissionsLabel}
            value={String(profile.permissions?.length || 0)}
          />

          <ProfileMobileInfo
            label={scopesLabel}
            value={String(profile.scopes?.length || 0)}
          />
        </div>
      </div>

      {(canUpdate && !locked) || (canDelete && !locked) ? (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {canUpdate && !locked ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Edit3 size={15} />
              {editLabel}
            </button>
          ) : null}

          {canDelete && !locked ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              <Trash2 size={15} />
              {deleteLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ProfileMobileInfo({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-1 truncate text-sm font-semibold text-slate-900">
        {value || '-'}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  emptyLabel
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {id: string; label: string}[];
  emptyLabel: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        <option value="">{emptyLabel}</option>

        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}