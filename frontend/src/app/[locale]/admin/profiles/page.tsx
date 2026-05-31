'use client';

import {useEffect, useMemo, useState, type FormEvent} from 'react';
import {useTranslations} from 'next-intl';
import {Edit3, Plus, RefreshCcw, ShieldCheck, Trash2, X} from 'lucide-react';
import {apiFetch} from '@/lib/api';
import {getUser, type AuthUser} from '@/lib/auth';
import {hasPermission} from '@/lib/permissions';
import {RequirePermission} from '@/components/auth/RequirePermission';
import {
  MultiSelectDropdown,
  type MultiSelectOption
} from '@/components/ui/MultiSelectDropdown';

type Permission = {
  id: string;
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

const actionFallbackLabels: Record<string, string> = {
  VIEW: 'Consulter',
  CREATE: 'Créer',
  UPDATE: 'Modifier',
  DELETE: 'Supprimer',
  VALIDATE: 'Valider',
  EXPORT: 'Exporter',
  ADMIN: 'Administrer'
};

const moduleFallbackLabels: Record<string, string> = {
  profiles: 'Gestion des profils',
  'audit-logs': 'Historique des actions',
  users: 'Utilisateurs',
  roles: 'Rôles',
  permissions: 'Permissions',

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
  reports: 'Reporting'
};

const moduleGroupFallbackLabels: Record<string, string> = {
  profiles: 'Administration',
  'audit-logs': 'Administration',
  users: 'Administration',
  roles: 'Administration',
  permissions: 'Administration',

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

  'agricultural-projects': 'Production agricole',
  plantations: 'Production agricole',
  treatments: 'Traitements',
  harvests: 'Récoltes',
  productions: 'Productions',
  charges: 'Charges',

  shipments: 'Flux ferme-usine',
  receptions: 'Flux ferme-usine',
  conditioning: 'Flux ferme-usine',

  alerts: 'Pilotage',
  dashboard: 'Pilotage',
  reports: 'Pilotage'
};

export default function ProfilesPage() {
  return (
    <RequirePermission module="profiles" action="VIEW">
      <ProfilesContent />
    </RequirePermission>
  );
}

function ProfilesContent() {
  const t = useTranslations('Profiles');

  const safeT = (key: string, fallback: string) => {
    try {
      return t(key);
    } catch {
      return fallback;
    }
  };

  const scopeTypes = useMemo(
    () => [
      {value: 'GROUP', label: safeT('scopeTypes.group', 'Groupe')},
      {value: 'COMPANY', label: safeT('scopeTypes.company', 'Entreprise')},
      {value: 'FARM', label: safeT('scopeTypes.farm', 'Ferme')},
      {value: 'FACTORY', label: safeT('scopeTypes.factory', 'Usine')},
      {value: 'STATION', label: safeT('scopeTypes.station', 'Station / UC')}
    ],
    []
  );

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [meta, setMeta] = useState<ProfilesMeta | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canCreate = hasPermission(user, 'profiles', 'CREATE');
  const canUpdate = hasPermission(user, 'profiles', 'UPDATE');
  const canDelete = hasPermission(user, 'profiles', 'DELETE');

  const permissionOptions = useMemo<MultiSelectOption[]>(() => {
    return (meta?.permissions || []).map((permission) => {
      const moduleLabel = safeT(
        `modules.${permission.module}`,
        moduleFallbackLabels[permission.module] || permission.module
      );

      const actionLabel = safeT(
        `actions.${permission.action}`,
        actionFallbackLabels[permission.action] || permission.action
      );

      const groupLabel = safeT(
        `moduleGroups.${permission.module}`,
        moduleGroupFallbackLabels[permission.module] || safeT('moduleGroups.other', 'Autres')
      );

      return {
        value: `${permission.module}.${permission.action}`,
        label: `${moduleLabel} — ${actionLabel}`,
        description: permission.description || groupLabel,
        group: groupLabel
      };
    });
  }, [meta]);

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
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const profilesData = await apiFetch<Profile[]>('/profiles');
      const metaData = await apiFetch<ProfilesMeta>('/profiles/meta');

      setProfiles(profilesData);
      setMeta(metaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : safeT('errors.loading', 'Erreur de chargement.'));
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
    setForm(emptyForm);
    setEditingId(null);
    setOpenForm(true);
  }

  function startEdit(profile: Profile) {
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
      permissions: profile.permissions.map(
        (permission) => `${permission.module}.${permission.action}`
      ),
      scopes: profile.scopes.map((scope) => `${scope.entityType}:${scope.entityId}`)
    });

    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError('');

    const permissions = form.permissions.map((permissionKey) => {
      const [module, action] = permissionKey.split('.');

      return {
        module,
        action
      };
    });

    const scopes = form.scopes.map((scopeKey) => {
      const [entityType, entityId] = scopeKey.split(':');

      return {
        entityType,
        entityId
      };
    });

    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || null,
      title: form.title || null,
      jobTitle: form.jobTitle || null,
      managerId: form.managerId || undefined,
      assignmentType: form.assignmentType || undefined,
      assignmentId: form.assignmentId || undefined,
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
      setError(
        err instanceof Error
          ? err.message
          : safeT('errors.saving', 'Erreur lors de l’enregistrement.')
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile(profile: Profile) {
    const confirmed = window.confirm(
      safeT(
        'confirmDelete',
        `Désactiver le profil ${profile.firstName} ${profile.lastName} ?`
      )
        .replace('{firstName}', profile.firstName)
        .replace('{lastName}', profile.lastName)
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/profiles/${profile.id}`, {
        method: 'DELETE'
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : safeT('errors.deleting', 'Erreur lors de la suppression.')
      );
    }
  }

  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{safeT('section', 'Administration')}</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {safeT('title', 'Gestion des profils')}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {safeT(
                'description',
                'Créez des profils avec permissions, périmètres et supérieur hiérarchique. Un utilisateur ne peut accorder que les droits qu’il possède déjà.'
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              {safeT('refresh', 'Actualiser')}
            </button>

            {canCreate ? (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={16} />
                {safeT('newProfile', 'Nouveau profil')}
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
                {editingId ? safeT('editTitle', 'Modifier le profil') : safeT('createTitle', 'Créer un profil')}
              </h2>
              <p className="text-sm text-slate-500">
                {safeT(
                  'formDescription',
                  'Les permissions et périmètres proposés sont limités à vos propres droits.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {!editingId ? (
              <>
                <Field
                  label={safeT('fields.email', 'Email')}
                  value={form.email}
                  onChange={(value) => setForm({...form, email: value})}
                  required
                />

                <Field
                  label={safeT('fields.password', 'Mot de passe temporaire')}
                  type="password"
                  value={form.password}
                  onChange={(value) => setForm({...form, password: value})}
                  required
                />
              </>
            ) : null}

            <Field
              label={safeT('fields.lastName', 'Nom')}
              value={form.lastName}
              onChange={(value) => setForm({...form, lastName: value})}
              required
            />

            <Field
              label={safeT('fields.firstName', 'Prénom')}
              value={form.firstName}
              onChange={(value) => setForm({...form, firstName: value})}
              required
            />

            <Field
              label={safeT('fields.phone', 'Téléphone')}
              value={form.phone}
              onChange={(value) => setForm({...form, phone: value})}
            />

            <Field
              label={safeT('fields.title', 'Titre')}
              placeholder={safeT('placeholders.title', 'Ex : Directeur de pôle')}
              value={form.title}
              onChange={(value) => setForm({...form, title: value})}
            />

            <Field
              label={safeT('fields.jobTitle', 'Poste')}
              placeholder={safeT('placeholders.jobTitle', 'Ex : Responsable qualité')}
              value={form.jobTitle}
              onChange={(value) => setForm({...form, jobTitle: value})}
            />

            <SelectField
              label={safeT('fields.manager', 'Supérieur hiérarchique')}
              emptyLabel={safeT('fields.notProvided', 'Non renseigné')}
              value={form.managerId}
              onChange={(value) => setForm({...form, managerId: value})}
              options={meta?.managers || []}
            />

            <SelectField
              label={safeT('fields.assignmentType', 'Type d’affectation')}
              emptyLabel={safeT('fields.notProvided', 'Non renseigné')}
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
              label={safeT('fields.assignment', 'Affectation')}
              emptyLabel={safeT('fields.notProvided', 'Non renseigné')}
              value={form.assignmentId}
              onChange={(value) => setForm({...form, assignmentId: value})}
              options={
                form.assignmentType ? meta?.scopeTargets?.[form.assignmentType] || [] : []
              }
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-slate-600" />
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {safeT('permissionsTitle', 'Fonctionnalités autorisées')}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {safeT(
                      'permissionsDescription',
                      'Sélectionnez les actions métier que ce profil pourra utiliser.'
                    )}
                  </p>
                </div>
              </div>

            <MultiSelectDropdown
            label={safeT('permissionsLabel', 'Fonctionnalités')}
            placeholder={safeT(
                'permissionsPlaceholder',
                'Choisir une ou plusieurs fonctionnalités'
            )}
            values={form.permissions}
            options={permissionOptions}
            onChange={(values) => setForm({...form, permissions: values})}
            emptyLabel={safeT('emptyPermissions', 'Aucune fonctionnalité disponible')}
            searchPlaceholder={safeT('searchPlaceholder', 'Rechercher...')}
            selectedCountLabel={(count) =>
                safeT('selectedCount', '{count} sélectionné(s)').replace(
                '{count}',
                String(count)
                )
            }
            />
            </section>

            <section className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-950">
                  {safeT('scopesTitle', 'Périmètres autorisés')}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {safeT(
                    'scopesDescription',
                    'Un périmètre parent donne accès aux éléments qui en dépendent.'
                  )}
                </p>
              </div>

            <MultiSelectDropdown
            label={safeT('scopesLabel', 'Périmètres')}
            placeholder={safeT('scopesPlaceholder', 'Choisir un ou plusieurs périmètres')}
            values={form.scopes}
            options={scopeOptions}
            onChange={(values) => setForm({...form, scopes: values})}
            emptyLabel={safeT('emptyScopes', 'Aucun périmètre disponible')}
            searchPlaceholder={safeT('searchPlaceholder', 'Rechercher...')}
            selectedCountLabel={(count) =>
                safeT('selectedCount', '{count} sélectionné(s)').replace(
                '{count}',
                String(count)
                )
            }
            />
            </section>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {safeT('cancel', 'Annuler')}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? safeT('saving', 'Enregistrement...') : safeT('save', 'Enregistrer')}
            </button>
          </div>
        </form>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            {safeT('existingProfiles', 'Profils existants')}
          </h2>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-500">
            {safeT('loading', 'Chargement...')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">{safeT('table.profile', 'Profil')}</th>
                  <th className="px-5 py-3">{safeT('table.titleJob', 'Titre / poste')}</th>
                  <th className="px-5 py-3">{safeT('table.manager', 'Supérieur')}</th>
                  <th className="px-5 py-3">{safeT('table.permissions', 'Permissions')}</th>
                  <th className="px-5 py-3">{safeT('table.scopes', 'Périmètres')}</th>
                  <th className="px-5 py-3">{safeT('table.status', 'Statut')}</th>
                  <th className="px-5 py-3 text-right">{safeT('table.actions', 'Actions')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-950">
                        {profile.firstName} {profile.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{profile.email}</div>
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
                      {profile.permissions.length}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {profile.scopes.length}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {profile.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() => startEdit(profile)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white hover:text-slate-950"
                            title={safeT('actions.edit', 'Modifier')}
                          >
                            <Edit3 size={16} />
                          </button>
                        ) : null}

                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => deleteProfile(profile)}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title={safeT('actions.delete', 'Supprimer')}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}

                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      {safeT('noProfiles', 'Aucun profil trouvé.')}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
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
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
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
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
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