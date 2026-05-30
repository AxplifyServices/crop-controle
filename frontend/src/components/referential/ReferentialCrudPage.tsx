'use client';

import {useEffect, useMemo, useState} from 'react';
import {ChevronDown, ChevronRight, Edit3, Info, Plus, RefreshCcw, Trash2, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {apiFetch} from '@/lib/api';
import {getUser, type AuthUser} from '@/lib/auth';
import {hasPermission} from '@/lib/permissions';
import type {ResourceConfig, ResourceField, ResourceOption} from '@/lib/phase2-resources';
import {RequirePermission} from '@/components/auth/RequirePermission';

type RecordItem = Record<string, any>;
type LookupOptionsMap = Record<string, ResourceOption[]>;

export function ReferentialCrudPage({config}: {config: ResourceConfig}) {
  return (
    <RequirePermission module={config.module} action="VIEW">
      <ReferentialCrudContent config={config} />
    </RequirePermission>
  );
}

function ReferentialCrudContent({config}: {config: ResourceConfig}) {
  const t = useTranslations('Referential');

  const [items, setItems] = useState<RecordItem[]>([]);
  const [form, setForm] = useState<RecordItem>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [lookupOptions, setLookupOptions] = useState<LookupOptionsMap>({});
  const [infoItem, setInfoItem] = useState<RecordItem | null>(null);

  const canCreate = hasPermission(user, config.module, 'CREATE');
  const canUpdate = hasPermission(user, config.module, 'UPDATE');
  const canDelete = hasPermission(user, config.module, 'DELETE');

  const visibleFields = useMemo(() => config.listFields, [config.listFields]);

  const visibleFormFields = useMemo(
    () => config.fields.filter((field) => isFieldVisible(field, form)),
    [config.fields, form]
  );

  const activeItems = useMemo(
    () => items.filter((item) => normalizeStatus(item.status) === 'ACTIVE'),
    [items]
  );

  const inactiveItems = useMemo(
    () => items.filter((item) => normalizeStatus(item.status) === 'INACTIVE'),
    [items]
  );

  const archivedItems = useMemo(
    () => items.filter((item) => normalizeStatus(item.status) === 'ARCHIVED'),
    [items]
  );

  const otherItems = useMemo(
    () =>
      items.filter((item) => {
        const status = normalizeStatus(item.status);
        return status !== 'ACTIVE' && status !== 'INACTIVE' && status !== 'ARCHIVED';
      }),
    [items]
  );

  async function loadItems() {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<unknown>(config.endpoint);
      setItems(normalizeApiRows(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  }

  async function loadLookups(currentUser: AuthUser | null) {
    const lookupFields = config.fields.filter((field) => field.type === 'lookup' && field.lookup);

    if (lookupFields.length === 0) return;

    const nextLookups: LookupOptionsMap = {};
    const lookupErrors: string[] = [];

    await Promise.all(
      lookupFields.map(async (field) => {
        if (!field.lookup) return;

        try {
          const data = await apiFetch<unknown>(field.lookup.endpoint);
          const rows = normalizeApiRows(data);

          const allowedRows = filterRowsByScope(rows, field, currentUser);

          nextLookups[field.key] = allowedRows
            .filter((row) => row[field.lookup!.valueKey] !== null && row[field.lookup!.valueKey] !== undefined)
            .map((row) => ({
              value: String(row[field.lookup!.valueKey]),
              labelKey: buildLookupLabel(row, field.lookup!.labelKeys)
            }));
        } catch (err) {
          nextLookups[field.key] = [];

          lookupErrors.push(
            `${field.key} (${field.lookup.endpoint}) : ${
              err instanceof Error ? err.message : 'Erreur API'
            }`
          );
        }
      })
    );

    setLookupOptions(nextLookups);

    if (lookupErrors.length > 0) {
      setError(`Certaines listes déroulantes ne sont pas chargées : ${lookupErrors.join(' | ')}`);
    }
  }

  useEffect(() => {
    const currentUser = getUser();

    setUser(currentUser);
    loadItems();
    loadLookups(currentUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setForm(buildEditForm(config, item));
    setEditingId(item.id);
    setOpenForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function setFieldValue(field: ResourceField, value: string | string[]) {
    setForm((current) => {
      const nextValue =
        field.type === 'number'
          ? value === ''
            ? null
            : Number(value)
          : value === ''
            ? null
            : value;

      const next = {
        ...current,
        [field.key]: nextValue
      };

      for (const childField of config.fields) {
        if (childField.dependsOn?.fieldKey === field.key) {
          next[childField.key] = null;
        }
      }

      for (const childField of config.fields) {
        if (!isFieldVisible(childField, next)) {
          next[childField.key] = null;
        }
      }

      return next;
    });
  }

  function cleanPayload(payload: RecordItem) {
    const cleaned: RecordItem = {};

    for (const field of config.fields) {
      if (field.persist === false) {
        continue;
      }

      if (!isFieldVisible(field, payload)) {
        continue;
      }

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
      setError(err instanceof Error ? err.message : t('messages.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: RecordItem) {
    const confirmed = window.confirm(t('messages.confirmDelete'));

    if (!confirmed) return;

    setError('');

    try {
      await apiFetch(`${config.endpoint}/${item.id}`, {
        method: 'DELETE'
      });

      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.deleteError'));
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              {t(config.titleKey)}
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              {t(config.descriptionKey)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadItems}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              {t('actions.refresh')}
            </button>

            {canCreate ? (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Plus size={16} />
                {t('actions.add')}
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
              {editingId ? t('actions.edit') : t('actions.add')}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label={t('actions.cancel')}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleFormFields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={form[field.key]}
                form={form}
                currentRecordId={editingId}
                lookupOptions={lookupOptions}
                onChange={(value) => setFieldValue(field, value)}
              />
            ))}

            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {saving ? t('messages.saving') : t('actions.save')}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {t('actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="space-y-5">
        <RecordsTable
          title={t('sections.active')}
          items={activeItems}
          config={config}
          visibleFields={visibleFields}
          lookupOptions={lookupOptions}
          loading={loading}
          canUpdate={canUpdate}
          canDelete={canDelete}
          defaultOpen
          onInfo={setInfoItem}
          onEdit={startEdit}
          onDelete={deleteItem}
        />

        <RecordsTable
          title={t('sections.inactive')}
          items={inactiveItems}
          config={config}
          visibleFields={visibleFields}
          lookupOptions={lookupOptions}
          loading={false}
          canUpdate={canUpdate}
          canDelete={canDelete}
          defaultOpen={false}
          onInfo={setInfoItem}
          onEdit={startEdit}
          onDelete={deleteItem}
        />

        <RecordsTable
          title={t('sections.archived')}
          items={archivedItems}
          config={config}
          visibleFields={visibleFields}
          lookupOptions={lookupOptions}
          loading={false}
          canUpdate={canUpdate}
          canDelete={canDelete}
          defaultOpen={false}
          onInfo={setInfoItem}
          onEdit={startEdit}
          onDelete={deleteItem}
        />

        {otherItems.length > 0 ? (
          <RecordsTable
            title={t('sections.other')}
            items={otherItems}
            config={config}
            visibleFields={visibleFields}
            lookupOptions={lookupOptions}
            loading={false}
            canUpdate={canUpdate}
            canDelete={canDelete}
            defaultOpen={false}
            onInfo={setInfoItem}
            onEdit={startEdit}
            onDelete={deleteItem}
          />
        ) : null}

        {infoItem ? (
          <DetailSheet
            item={infoItem}
            config={config}
            lookupOptions={lookupOptions}
            onClose={() => setInfoItem(null)}
          />
        ) : null}
      </div>
    
    </div>
  );
}

function RecordsTable({
  title,
  items,
  config,
  visibleFields,
  lookupOptions,
  loading,
  canUpdate,
  canDelete,
  defaultOpen,
  onInfo,
  onEdit,
  onDelete
}: {
  title: string;
  items: RecordItem[];
  config: ResourceConfig;
  visibleFields: string[];
  lookupOptions: LookupOptionsMap;
  loading: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  defaultOpen?: boolean;
  onInfo: (item: RecordItem) => void;
  onEdit: (item: RecordItem) => void;
  onDelete: (item: RecordItem) => void;
}) {
  const t = useTranslations('Referential');
  const [open, setOpen] = useState(defaultOpen ?? true);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t('list.count', {count: items.length})}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {open ? (
        loading ? (
          <div className="p-5 text-sm text-slate-500">
            {t('messages.loading')}
          </div>
        ) : items.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            {t('messages.empty')}
          </div>
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
                      {getFieldLabel(config, field, t)}
                    </th>
                  ))}

                  <th className="w-[170px] px-4 py-3 text-right font-semibold text-slate-600">
                    {t('actions.title')}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    {visibleFields.map((field) => (
                      <td key={field} className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {formatListValue(config, field, item[field], lookupOptions, t)}
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onInfo(item)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                          title={t('actions.info')}
                        >
                          <Info size={16} />
                        </button>

                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                            title={t('actions.edit')}
                          >
                            <Edit3 size={16} />
                          </button>
                        ) : null}

                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                            title={t('actions.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}

                        {!canUpdate && !canDelete ? (
                          <span className="text-xs text-slate-400">
                            {t('messages.readOnly')}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}

function DetailSheet({
  item,
  config,
  lookupOptions,
  onClose
}: {
  item: RecordItem;
  config: ResourceConfig;
  lookupOptions: LookupOptionsMap;
  onClose: () => void;
}) {
  const t = useTranslations('Referential');
  const detailKeys = getDetailKeys(config, item);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/30 p-0 backdrop-blur-[2px]">
      <button
        type="button"
        className="hidden flex-1 cursor-default lg:block"
        onClick={onClose}
        aria-label={t('actions.close')}
      />

      <aside className="h-full w-full overflow-y-auto bg-white shadow-2xl lg:max-w-xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {t('actions.info')}
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {getBestItemTitle(config, item, lookupOptions, t)}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={t('actions.close')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {t('details.mainInfo')}
              </h3>
            </div>

            <dl className="divide-y divide-slate-100">
              {detailKeys.map((key) => (
                <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500">
                    {getDetailLabel(config, key, t)}
                  </dt>

                  <dd className="break-words text-sm text-slate-900 sm:col-span-2">
                    {formatListValue(config, key, item[key], lookupOptions, t)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FieldInput({
  field,
  value,
  form,
  currentRecordId,
  lookupOptions,
  onChange
}: {
  field: ResourceField;
  value: any;
  form: RecordItem;
  currentRecordId: string | null;
  lookupOptions: LookupOptionsMap;
  onChange: (value: string | string[]) => void;
}) {
  const t = useTranslations('Referential');

  const inputClass =
    'mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

  const options = getFieldOptions(field, form, lookupOptions, currentRecordId);
  const isSelectLike = field.type === 'select' || field.type === 'lookup';

  if (field.type === 'multiselect') {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          {getInputLabel(field, form, t)}
          {field.required ? <span className="text-red-600"> *</span> : null}
        </span>

        <select
          multiple
          value={selectedValues}
          required={field.required}
          onChange={(event) => {
            const nextValues = Array.from(event.target.selectedOptions).map(
              (option) => option.value
            );

            onChange(nextValues);
          }}
          className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {getOptionLabel(option, t)}
            </option>
          ))}
        </select>

        <p className="mt-1 text-xs text-slate-400">
          {t('messages.multiSelectHelp')}
        </p>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {getInputLabel(field, form, t)}
        {field.required ? <span className="text-red-600"> *</span> : null}
      </span>

      {isSelectLike ? (
        <select
          value={value ?? ''}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">{t('actions.select')}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {getOptionLabel(option, t)}
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

function buildEditForm(config: ResourceConfig, item: RecordItem) {
  const nextForm: RecordItem = {};

  for (const field of config.fields) {
    const value = item[field.key];

    if (value === undefined) {
      nextForm[field.key] = null;
      continue;
    }

    if (field.type === 'number') {
      nextForm[field.key] = value === null || value === '' ? null : Number(value);
      continue;
    }

    if (field.type === 'multiselect') {
      nextForm[field.key] = Array.isArray(value) ? value : [];
      continue;
    }

    nextForm[field.key] = value;
  }

  if (!nextForm.country && nextForm.region) {
    const country = findCountryByRegion(config, String(nextForm.region));

    if (country) {
      nextForm.country = country;
    }
  }

  return nextForm;
}

function findCountryByRegion(config: ResourceConfig, region: string) {
  const regionField = config.fields.find((field) => field.key === 'region');

  if (!regionField?.dependsOn) {
    return null;
  }

  for (const [country, regions] of Object.entries(regionField.dependsOn.optionsByValue)) {
    if (regions.some((item) => item.value === region)) {
      return country;
    }
  }

  return null;
}

function isFieldVisible(field: ResourceField, form: RecordItem) {
  if (!field.visibleWhen) {
    return true;
  }

  const parentValue = form[field.visibleWhen.fieldKey];

  if (!parentValue) {
    return false;
  }

  return field.visibleWhen.values.includes(String(parentValue));
}

function getInputLabel(
  field: ResourceField,
  form: RecordItem,
  t: ReturnType<typeof useTranslations>
) {
  if (field.labelKeyByValue) {
    const parentValue = form[field.labelKeyByValue.fieldKey];

    if (parentValue) {
      const dynamicLabelKey = field.labelKeyByValue.labelsByValue[String(parentValue)];

      if (dynamicLabelKey) {
        return t(dynamicLabelKey);
      }
    }
  }

  return t(field.labelKey);
}

function getFieldOptions(
  field: ResourceField,
  form: RecordItem,
  lookupOptions: LookupOptionsMap,
  currentRecordId: string | null
) {
  if (field.type === 'lookup') {
    const options = lookupOptions[field.key] || [];

    if (!field.lookup?.excludeCurrentRecord || !currentRecordId) {
      return options;
    }

    return options.filter((option) => option.value !== currentRecordId);
  }

  if (field.dependsOn) {
    const parentValue = form[field.dependsOn.fieldKey];

    if (!parentValue) return [];

    return field.dependsOn.optionsByValue[String(parentValue)] || [];
  }

  return field.options || [];
}

function getOptionLabel(
  option: ResourceOption,
  t: ReturnType<typeof useTranslations>
) {
  if (option.labelKey.startsWith('options.')) {
    return t(option.labelKey);
  }

  return option.labelKey;
}

function normalizeApiRows(data: unknown): RecordItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const payload = data as Record<string, unknown>;

  if (Array.isArray(payload.data)) {
    return payload.data as RecordItem[];
  }

  if (Array.isArray(payload.items)) {
    return payload.items as RecordItem[];
  }

  if (Array.isArray(payload.results)) {
    return payload.results as RecordItem[];
  }

  if (Array.isArray(payload.records)) {
    return payload.records as RecordItem[];
  }

  return [];
}

function buildLookupLabel(row: RecordItem, labelKeys: string[]) {
  return labelKeys
    .map((key) => row[key])
    .filter((value) => value !== null && value !== undefined && value !== '')
    .join(' · ');
}

function filterRowsByScope(
  rows: RecordItem[],
  field: ResourceField,
  user: AuthUser | null
) {
  const scopeEntityType = field.lookup?.scopeEntityType;

  if (!scopeEntityType || !user?.scopes?.length) {
    return rows;
  }

  const allowedIds = user.scopes
    .filter((scope) => scope.entityType === scopeEntityType)
    .map((scope) => scope.entityId);

  if (allowedIds.length === 0) {
    return rows;
  }

  return rows.filter((row) => allowedIds.includes(String(row.id)));
}

function getFieldLabel(
  config: ResourceConfig,
  key: string,
  t: ReturnType<typeof useTranslations>
) {
  const field = config.fields.find((item) => item.key === key);

  if (!field) return key;

  return t(field.labelKey);
}

function getDetailKeys(config: ResourceConfig, item: RecordItem) {
  const configuredKeys = config.fields.map((field) => field.key);

  const technicalKeys = Object.keys(item).filter(
    (key) =>
      !configuredKeys.includes(key) &&
      !key.endsWith('_id') &&
      item[key] !== undefined &&
      item[key] !== null &&
      item[key] !== ''
  );

  return [...configuredKeys, ...technicalKeys];
}

function getDetailLabel(
  config: ResourceConfig,
  key: string,
  t: ReturnType<typeof useTranslations>
) {
  const field = config.fields.find((item) => item.key === key);

  if (field) {
    return t(field.labelKey);
  }

  return formatTechnicalLabel(key);
}

function getBestItemTitle(
  config: ResourceConfig,
  item: RecordItem,
  lookupOptions: LookupOptionsMap,
  t: ReturnType<typeof useTranslations>
) {
  if (item.name) return String(item.name);
  if (item.title) return String(item.title);
  if (item.label) return String(item.label);
  if (item.code) return String(item.code);

  const firstVisibleField = config.listFields[0];

  if (firstVisibleField) {
    return formatListValue(config, firstVisibleField, item[firstVisibleField], lookupOptions, t);
  }

  return t('details.untitled');
}

function formatTechnicalLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatListValue(
  config: ResourceConfig,
  fieldKey: string,
  value: any,
  lookupOptions: LookupOptionsMap,
  t: ReturnType<typeof useTranslations>
) {
  const field = config.fields.find((item) => item.key === fieldKey);

  if (field?.type === 'lookup') {
    const option = lookupOptions[fieldKey]?.find(
      (item) => item.value === String(value)
    );

    if (option) {
      return option.labelKey;
    }
  }

  if ((field?.type === 'select' || field?.type === 'multiselect') && field.options) {
    if (Array.isArray(value)) {
      const labels = value
        .map((itemValue) => field.options?.find((option) => option.value === String(itemValue)))
        .filter(Boolean)
        .map((option) => getOptionLabel(option as ResourceOption, t));

      return labels.length ? labels.join(', ') : '-';
    }

    const option = field.options.find((item) => item.value === String(value));

    if (option) {
      return getOptionLabel(option, t);
    }
  }

  return formatValue(value);
}

function normalizeStatus(status: any) {
  if (!status) {
    return 'ACTIVE';
  }

  return String(status).toUpperCase();
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}