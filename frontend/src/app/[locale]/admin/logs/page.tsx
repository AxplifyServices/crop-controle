'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {RefreshCcw, Search} from 'lucide-react';
import {apiFetch} from '@/lib/api';
import {RequirePermission} from '@/components/auth/RequirePermission';

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    title?: string | null;
    jobTitle?: string | null;
  } | null;
};

export default function AuditLogsPage() {
  return (
    <RequirePermission module="audit-logs" action="VIEW">
      <AuditLogsContent />
    </RequirePermission>
  );
}

function AuditLogsContent() {
  const t = useTranslations('AuditLogs');

  const safeT = (key: string, fallback: string) => {
    try {
      return t(key);
    } catch {
      return fallback;
    }
  };

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();

    if (action) params.set('action', action);
    if (entityType) params.set('entityType', entityType);

    try {
      const data = await apiFetch<AuditLog[]>(
        `/audit-logs${params.toString() ? `?${params.toString()}` : ''}`
      );

      setLogs(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : safeT('errors.loading', 'Erreur de chargement.')
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  }

  function getActionLabel(value: string) {
    const normalized = value.replace('_FAILED', '').toLowerCase();

    const labels: Record<string, string> = {
      login: safeT('actions.login', 'Connexion'),
      view: safeT('actions.view', 'Consultation'),
      create: safeT('actions.create', 'Création'),
      update: safeT('actions.update', 'Modification'),
      delete: safeT('actions.delete', 'Suppression')
    };

    const label = labels[normalized] || value;

    if (value.includes('_FAILED')) {
      return `${label} — ${safeT('actions.failed', 'Échec')}`;
    }

    return label;
  }

  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {safeT('section', 'Administration')}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {safeT('title', 'Historique des logs')}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {safeT(
                'description',
                'Consultez les actions effectuées sur la plateforme. Chaque profil voit uniquement ses propres logs et ceux de ses profils descendants.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={loadLogs}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            {safeT('refresh', 'Actualiser')}
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-950">
            {safeT('filtersTitle', 'Filtres')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {safeT(
              'filtersDescription',
              'Filtrez les logs par type d’action ou par module.'
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              {safeT('fields.action', 'Action')}
            </span>

            <select
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">{safeT('all', 'Toutes')}</option>
              <option value="LOGIN">{safeT('actions.login', 'Connexion')}</option>
              <option value="VIEW">{safeT('actions.view', 'Consultation')}</option>
              <option value="CREATE">{safeT('actions.create', 'Création')}</option>
              <option value="UPDATE">{safeT('actions.update', 'Modification')}</option>
              <option value="DELETE">{safeT('actions.delete', 'Suppression')}</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              {safeT('fields.module', 'Module')}
            </span>

            <input
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              placeholder={safeT(
                'placeholders.module',
                'profiles, companies, farms...'
              )}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={loadLogs}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Search size={16} />
              {safeT('filter', 'Filtrer')}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            {safeT('latestActions', 'Dernières actions')}
          </h2>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-500">
            {safeT('loading', 'Chargement...')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">{safeT('table.date', 'Date')}</th>
                  <th className="px-5 py-3">
                    {safeT('table.user', 'Utilisateur')}
                  </th>
                  <th className="px-5 py-3">{safeT('table.action', 'Action')}</th>
                  <th className="px-5 py-3">{safeT('table.module', 'Module')}</th>
                  <th className="px-5 py-3">{safeT('table.ip', 'IP')}</th>
                  <th className="px-5 py-3">{safeT('table.details', 'Détails')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-950">
                        {log.user
                          ? `${log.user.firstName} ${log.user.lastName}`
                          : safeT('system', 'Système')}
                      </div>

                      <div className="text-xs text-slate-500">
                        {log.user?.email || '-'}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {getActionLabel(log.action)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div>{log.entityType}</div>
                      <div className="text-xs text-slate-400">
                        {log.entityId || '-'}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {log.ipAddress || '-'}
                    </td>

                    <td className="px-5 py-4">
                      <details>
                        <summary className="cursor-pointer text-slate-700">
                          {safeT('details', 'Voir le détail')}
                        </summary>

                        <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                          {JSON.stringify(log.newValue, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}

                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      {safeT('noLogs', 'Aucun log trouvé.')}
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