'use client';

import {useCallback, useEffect, useState} from 'react';
import {
  CalendarClock,
  ChevronRight,
  Eye,
  Globe2,
  Monitor,
  RefreshCcw,
  Search,
  Server,
  User,
  X
} from 'lucide-react';
import {useTranslations} from 'next-intl';
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

type DetailRow = {
  label: string;
  value: string;
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

  const safeT = useCallback(
    (key: string, fallback: string) => {
      try {
        return t(key);
      } catch {
        return fallback;
      }
    },
    [t]
  );

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLogs() {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();

    if (action) {
      params.set('action', action);
    }

    if (entityType) {
      params.set('entityType', entityType);
    }

    try {
      const data = await apiFetch<unknown>(
        `/audit-logs${params.toString() ? `?${params.toString()}` : ''}`
      );

      setLogs(normalizeAuditRows(data));
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
    const isFailed = value.includes('_FAILED');
    const normalized = value.replace('_FAILED', '').toLowerCase();

    const labels: Record<string, string> = {
      login: safeT('actions.login', 'Connexion'),
      view: safeT('actions.view', 'Consultation'),
      create: safeT('actions.create', 'Création'),
      update: safeT('actions.update', 'Modification'),
      delete: safeT('actions.delete', 'Suppression')
    };

    const label = labels[normalized] || humanize(value);

    if (isFailed) {
      return `${label} — ${safeT('actions.failed', 'Échec')}`;
    }

    return label;
  }

  function getActionBadgeClass(value: string) {
    const normalized = String(value || '').toUpperCase();

    if (normalized.includes('FAILED')) {
      return 'bg-red-50 text-red-700 ring-1 ring-red-100';
    }

    if (normalized.includes('CREATE')) {
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
    }

    if (normalized.includes('UPDATE')) {
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    }

    if (normalized.includes('DELETE')) {
      return 'bg-red-50 text-red-700 ring-1 ring-red-100';
    }

    if (normalized.includes('LOGIN')) {
      return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100';
    }

    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  }

  function getUserLabel(log: AuditLog) {
    if (!log.user) {
      return safeT('system', 'Système');
    }

    const fullName = `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim();

    return fullName || log.user.email || safeT('system', 'Système');
  }

  function getRequestInfo(log: AuditLog) {
    const source = isPlainObject(log.newValue) ? log.newValue : {};

    return {
      path: stringifyValue(source.path),
      method: stringifyValue(source.method),
      status: stringifyValue(source.status),
      durationMs: stringifyValue(source.durationMs)
    };
  }

  function getReadableDetails(log: AuditLog): DetailRow[] {
    const request = getRequestInfo(log);
    const rows: DetailRow[] = [];

    if (request.method || request.path) {
      rows.push({
        label: safeT('detailLabels.request', 'Requête'),
        value: [request.method, request.path].filter(Boolean).join(' ')
      });
    }

    if (request.status) {
      rows.push({
        label: safeT('detailLabels.status', 'Statut'),
        value: request.status
      });
    }

    if (request.durationMs) {
      rows.push({
        label: safeT('detailLabels.duration', 'Durée'),
        value: `${request.durationMs} ms`
      });
    }

    if (log.entityId) {
      rows.push({
        label: safeT('detailLabels.entityId', 'Identifiant'),
        value: log.entityId
      });
    }

    if (log.ipAddress) {
      rows.push({
        label: safeT('detailLabels.ip', 'Adresse IP'),
        value: log.ipAddress
      });
    }

    if (log.userAgent) {
      rows.push({
        label: safeT('detailLabels.device', 'Navigateur / appareil'),
        value: simplifyUserAgent(log.userAgent)
      });
    }

    return rows;
  }

  function getChangeRows(log: AuditLog): DetailRow[] {
    if (!isPlainObject(log.oldValue) || !isPlainObject(log.newValue)) {
      return [];
    }

    const ignoredKeys = new Set([
      'path',
      'query',
      'method',
      'params',
      'status',
      'durationMs'
    ]);

    const keys = Array.from(
      new Set([...Object.keys(log.oldValue), ...Object.keys(log.newValue)])
    ).filter((key) => !ignoredKeys.has(key));

    return keys
      .map((key) => {
        const oldText = stringifyValue(log.oldValue?.[key]);
        const newText = stringifyValue(log.newValue?.[key]);

        if (oldText === newText) {
          return null;
        }

        return {
          label: humanize(key),
          value: `${oldText || '-'} → ${newText || '-'}`
        };
      })
      .filter(Boolean) as DetailRow[];
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={loadLogs}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            {safeT('latestActions', 'Dernières actions')}
          </h2>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-500">
            {safeT('loading', 'Chargement...')}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            {safeT('noLogs', 'Aucun log trouvé.')}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">{safeT('table.date', 'Date')}</th>
                    <th className="px-5 py-3">{safeT('table.user', 'Utilisateur')}</th>
                    <th className="px-5 py-3">{safeT('table.action', 'Action')}</th>
                    <th className="px-5 py-3">{safeT('table.module', 'Module')}</th>
                    <th className="px-5 py-3">{safeT('table.ip', 'IP')}</th>
                    <th className="px-5 py-3 text-right">
                      {safeT('table.details', 'Détails')}
                    </th>
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
                          {getUserLabel(log)}
                        </div>

                        <div className="text-xs text-slate-500">
                          {log.user?.email || '-'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            getActionBadgeClass(log.action)
                          ].join(' ')}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div>{humanize(log.entityType)}</div>
                        <div className="text-xs text-slate-400">
                          {log.entityId || '-'}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {log.ipAddress || '-'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye size={14} />
                            {safeT('details', 'Voir le détail')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 bg-slate-50/60 p-3 md:hidden">
              {logs.map((log) => (
                <AuditLogMobileCard
                  key={log.id}
                  log={log}
                  date={formatDate(log.createdAt)}
                  actionLabel={getActionLabel(log.action)}
                  actionClass={getActionBadgeClass(log.action)}
                  userLabel={getUserLabel(log)}
                  detailsLabel={safeT('details', 'Voir le détail')}
                  onOpen={() => setSelectedLog(log)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {selectedLog ? (
        <AuditLogDetailSheet
          log={selectedLog}
          title={safeT('details', 'Voir le détail')}
          closeLabel={safeT('close', 'Fermer')}
          dateLabel={safeT('table.date', 'Date')}
          userLabel={safeT('table.user', 'Utilisateur')}
          actionLabel={safeT('table.action', 'Action')}
          moduleLabel={safeT('table.module', 'Module')}
          detailsTitle={safeT('detailLabels.summary', 'Résumé')}
          changesTitle={safeT('detailLabels.changes', 'Modifications')}
          technicalTitle={safeT('detailLabels.technical', 'Informations techniques')}
          emptyDetails={safeT('detailLabels.empty', 'Aucun détail complémentaire.')}
          date={formatDate(selectedLog.createdAt)}
          user={getUserLabel(selectedLog)}
          action={getActionLabel(selectedLog.action)}
          actionClass={getActionBadgeClass(selectedLog.action)}
          module={humanize(selectedLog.entityType)}
          detailRows={getReadableDetails(selectedLog)}
          changeRows={getChangeRows(selectedLog)}
          onClose={() => setSelectedLog(null)}
        />
      ) : null}
    </main>
  );
}

function AuditLogMobileCard({
  log,
  date,
  actionLabel,
  actionClass,
  userLabel,
  detailsLabel,
  onOpen
}: {
  log: AuditLog;
  date: string;
  actionLabel: string;
  actionClass: string;
  userLabel: string;
  detailsLabel: string;
  onOpen: () => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CalendarClock size={14} />
            <span>{date}</span>
          </div>

          <h3 className="mt-2 truncate text-base font-semibold text-slate-950">
            {humanize(log.entityType)}
          </h3>

          <p className="mt-1 truncate text-sm text-slate-500">
            {userLabel}
          </p>
        </div>

        <span
          className={[
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
            actionClass
          ].join(' ')}
        >
          {actionLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {log.ipAddress ? (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-xs font-medium text-slate-500">IP</span>
            <span className="text-xs font-semibold text-slate-800">
              {log.ipAddress}
            </span>
          </div>
        ) : null}

        {log.entityId ? (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-xs font-medium text-slate-500">ID</span>
            <span className="max-w-[60%] truncate text-right text-xs font-semibold text-slate-800">
              {log.entityId}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-500">
          {detailsLabel}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
          <ChevronRight size={16} />
        </div>
      </div>
    </article>
  );
}

function AuditLogDetailSheet({
  log,
  title,
  closeLabel,
  dateLabel,
  userLabel,
  actionLabel,
  moduleLabel,
  detailsTitle,
  changesTitle,
  technicalTitle,
  emptyDetails,
  date,
  user,
  action,
  actionClass,
  module,
  detailRows,
  changeRows,
  onClose
}: {
  log: AuditLog;
  title: string;
  closeLabel: string;
  dateLabel: string;
  userLabel: string;
  actionLabel: string;
  moduleLabel: string;
  detailsTitle: string;
  changesTitle: string;
  technicalTitle: string;
  emptyDetails: string;
  date: string;
  user: string;
  action: string;
  actionClass: string;
  module: string;
  detailRows: DetailRow[];
  changeRows: DetailRow[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/30 p-0 backdrop-blur-[2px]">
      <button
        type="button"
        className="hidden flex-1 cursor-default lg:block"
        onClick={onClose}
        aria-label={closeLabel}
      />

      <aside className="h-full w-full overflow-y-auto bg-white shadow-2xl lg:max-w-xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {module}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={closeLabel}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={<CalendarClock size={17} />} label={dateLabel} value={date} />
            <InfoTile icon={<User size={17} />} label={userLabel} value={user} />
            <InfoTile
              icon={<Server size={17} />}
              label={moduleLabel}
              value={module}
            />
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 text-xs font-medium text-slate-500">
                {actionLabel}
              </div>

              <span
                className={[
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                  actionClass
                ].join(' ')}
              >
                {action}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">
                {detailsTitle}
              </h3>
            </div>

            {detailRows.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {detailRows.map((row) => (
                  <DetailLine key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 text-sm text-slate-500">
                {emptyDetails}
              </div>
            )}
          </section>

          {changeRows.length > 0 ? (
            <section className="rounded-2xl border border-slate-200">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  {changesTitle}
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {changeRows.map((row) => (
                  <DetailLine key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">
                {technicalTitle}
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              <DetailLine label="ID log" value={log.id} />
              <DetailLine label="Entity ID" value={log.entityId || '-'} />
              <DetailLine
                label="User Agent"
                value={log.userAgent ? simplifyUserAgent(log.userAgent) : '-'}
              />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        <span>{label}</span>
      </div>

      <div className="break-words text-sm font-semibold text-slate-950">
        {value || '-'}
      </div>
    </div>
  );
}

function DetailLine({label, value}: {label: string; value: string}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>

      <dd className="break-words text-sm text-slate-900 sm:col-span-2">
        {value || '-'}
      </dd>
    </div>
  );
}

function normalizeAuditRows(data: unknown): AuditLog[] {
  if (Array.isArray(data)) {
    return data as AuditLog[];
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const payload = data as Record<string, unknown>;

  if (Array.isArray(payload.data)) {
    return payload.data as AuditLog[];
  }

  if (Array.isArray(payload.items)) {
    return payload.items as AuditLog[];
  }

  if (Array.isArray(payload.results)) {
    return payload.results as AuditLog[];
  }

  if (Array.isArray(payload.records)) {
    return payload.records as AuditLog[];
  }

  return [];
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(stringifyValue).filter(Boolean).join(', ');
  }

  if (isPlainObject(value)) {
    return Object.entries(value)
      .map(([key, item]) => `${humanize(key)}: ${stringifyValue(item)}`)
      .join(' · ');
  }

  return String(value);
}

function humanize(value: string) {
  return String(value || '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function simplifyUserAgent(userAgent: string) {
  if (!userAgent) {
    return '-';
  }

  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  }

  if (userAgent.includes('Safari')) {
    return 'Safari';
  }

  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  }

  if (userAgent.includes('Edge')) {
    return 'Edge';
  }

  return userAgent.slice(0, 80);
}