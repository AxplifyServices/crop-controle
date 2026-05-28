'use client';

import {useEffect, useMemo, useState} from 'react';
import {Edit3, Plus, RefreshCcw, Trash2, X} from 'lucide-react';
import {apiFetch} from '@/lib/api';
import {getUser, type AuthUser} from '@/lib/auth';
import {hasPermission} from '@/lib/permissions';
import type {ResourceConfig, ResourceField} from '@/lib/phase2-resources';
import {RequirePermission} from '@/components/auth/RequirePermission';

type RecordItem = Record<string, any>;

export function ReferentialCrudPage({config}: {config: ResourceConfig}) {
  return (
    <RequirePermission module={config.module} action="VIEW">
      <ReferentialCrudContent config={config} />
    </RequirePermission>
  );
}

function ReferentialCrudContent({config}: {config: ResourceConfig}) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [form, setForm] = useState<RecordItem>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);

  const canCreate = hasPermission(user, config.module, 'CREATE');
  const canUpdate = hasPermission(user, config.module, 'UPDATE');
  const canDelete = hasPermission(user, config.module, 'DELETE');

  const visibleFields = useMemo(() => config.listFields, [config.listFields]);

  async function loadItems() {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<RecordItem[]>(config.endpoint);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setUser(getUser());
    loadItems();
  }, []);

  function resetForm() {
    setForm({});
    setEditingId(null);
    setOpenForm(false);
  }

  function startCreate() {
    setForm({});
    setEditingId(null);
    setOpenForm(true);
  }

  function startEdit(item: RecordItem) {
    setForm(item);
    setEditingId(item.id);
    setOpenForm(true);
  }

  function setFieldValue(field: ResourceField, value: string) {
    if (field.type === 'number') {
      setForm((current) => ({
        ...current,
        [field.key]: value === '' ? null : Number(value)
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [field.key]: value === '' ? null : value
    }));
  }

  function cleanPayload(payload: RecordItem) {
    const cleaned: RecordItem = {};

    for (const field of config.fields) {
      const value = payload[field.key];

      if (value !== undefined && value !== '') {
        cleaned[field.key] = value;
      }
    }

    return cleaned;
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      const payload = cleanPayload(form);

      if (editingId) {
        await apiFetch(`${config.endpoint}/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch(config.endpoint, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: RecordItem) {
    const confirmed = window.confirm('Confirmer la suppression / désactivation ?');

    if (!confirmed) return;

    setError('');

    try {
      await apiFetch(`${config.endpoint}/${item.id}`, {
        method: 'DELETE'
      });

      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression');
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Phase 2 · Référentiel organisationnel</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">{config.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{config.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadItems}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Actualiser
            </button>

            {canCreate ? (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Plus size={16} />
                Ajouter
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {openForm ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              {editingId ? 'Modifier' : 'Ajouter'}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {config.fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={(value) => setFieldValue(field, value)}
              />
            ))}

            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Liste</h2>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} enregistrement(s)
          </p>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-500">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">Aucun enregistrement.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {visibleFields.map((field) => (
                    <th
                      key={field}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600"
                    >
                      {getFieldLabel(config, field)}
                    </th>
                  ))}

                  <th className="w-[140px] px-4 py-3 text-right font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    {visibleFields.map((field) => (
                      <td key={field} className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {formatValue(item[field])}
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                            title="Modifier"
                          >
                            <Edit3 size={16} />
                          </button>
                        ) : null}

                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => deleteItem(item)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}

                        {!canUpdate && !canDelete ? (
                          <span className="text-xs text-slate-400">Lecture seule</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange
}: {
  field: ResourceField;
  value: any;
  onChange: (value: string) => void;
}) {
  const inputClass =
    'mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {field.label}
        {field.required ? <span className="text-red-600"> *</span> : null}
      </span>

      {field.type === 'select' ? (
        <select
          value={value ?? ''}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Sélectionner</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value ?? ''}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

function getFieldLabel(config: ResourceConfig, key: string) {
  return config.fields.find((field) => field.key === key)?.label || key;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}