'use client';

import type {ReactNode} from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  CalendarClock,
  ChevronRight,
  Eye,
  FileText,
  RefreshCcw,
  Search,
  ShieldCheck,
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

const PAGE_SIZE = 15;

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
    (key: string, fallback: string, values?: Record<string, string | number>) => {
      try {
        return values ? (t as any)(key, values) : t(key);
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
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMounted(true);
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
      setPage(1);
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
    const isFailed = String(value || '').includes('_FAILED');
    const normalized = String(value || '').replace('_FAILED', '').toLowerCase();

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

  function getActionVerb(value: string) {
    const normalized = String(value || '').replace('_FAILED', '').toUpperCase();

    const labels: Record<string, string> = {
      LOGIN: safeT('verbs.login', 's’est connecté'),
      CREATE: safeT('verbs.create', 'a créé'),
      UPDATE: safeT('verbs.update', 'a modifié'),
      DELETE: safeT('verbs.delete', 'a supprimé'),
      VIEW: safeT('verbs.view', 'a consulté')
    };

    return labels[normalized] || safeT(
      'verbs.generic',
      `a effectué l’action ${getActionLabel(value).toLowerCase()}`,
      {action: getActionLabel(value).toLowerCase()}
    );
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

    const fullName = normalizePersonName(log.user.firstName, log.user.lastName);

    if (fullName) {
      return fullName;
    }

    return formatEmailAsName(log.user.email) || safeT('system', 'Système');
  }

  function getUserSecondaryLabel(log: AuditLog) {
    if (!log.user) {
      return '';
    }

    return log.user.jobTitle || log.user.title || '';
  }

  function getEntityName(log: AuditLog) {
    const candidates = [
      log.newValue?.entityLabel,
      log.newValue?.name,
      log.newValue?.fullName,
      log.newValue?.full_name,
      log.newValue?.legalName,
      log.newValue?.legal_name,
      log.newValue?.label,
      log.newValue?.title,
      log.newValue?.code,
      log.newValue?.email,
      log.newValue?.body?.name,
      log.newValue?.body?.fullName,
      log.newValue?.body?.full_name,
      log.newValue?.body?.legalName,
      log.newValue?.body?.legal_name,
      log.newValue?.body?.label,
      log.newValue?.body?.title,
      log.newValue?.body?.code,
      log.newValue?.body?.email,
      log.oldValue?.entityLabel,
      log.oldValue?.name,
      log.oldValue?.fullName,
      log.oldValue?.full_name,
      log.oldValue?.legalName,
      log.oldValue?.legal_name,
      log.oldValue?.label,
      log.oldValue?.title,
      log.oldValue?.code,
      log.oldValue?.email
    ];

    for (const candidate of candidates) {
      const value = stringifyValue(candidate).trim();

      if (value) {
        return value;
      }
    }

    return '';
  }

  function getEntityReference(log: AuditLog) {
    return stringifyValue(log.entityId).trim();
  }

  function getBusinessMessage(log: AuditLog) {
    const actor = getUserLabel(log);
    const action = String(log.action || '').toUpperCase();
    const isFailed = action.includes('_FAILED');
    const entityLabel = getEntityTypeSentenceLabel(log.entityType);
    const entityName = getEntityName(log);
    const entityReference = getEntityReference(log);

    if (isFailed) {
      if (action.includes('LOGIN')) {
        return safeT(
          'messages.loginFailed',
          `Tentative de connexion échouée pour ${actor}.`,
          {actor}
        );
      }

      return safeT(
        'messages.actionFailed',
        `L’action ${getActionLabel(log.action).toLowerCase()} a échoué.`,
        {action: getActionLabel(log.action).toLowerCase()}
      );
    }

    if (action.includes('LOGIN')) {
      return safeT(
        'messages.loginSuccess',
        `L’utilisateur ${actor} s’est connecté.`,
        {actor}
      );
    }

    const verb = getActionVerb(log.action);

    if (entityName && entityReference) {
      return safeT(
        'messages.businessWithNameAndId',
        `L’utilisateur ${actor} ${verb} ${entityLabel} “${entityName}” (ID : ${entityReference}).`,
        {
          actor,
          verb,
          entity: entityLabel,
          name: entityName,
          id: entityReference
        }
      );
    }

    if (entityName) {
      return safeT(
        'messages.businessWithName',
        `L’utilisateur ${actor} ${verb} ${entityLabel} “${entityName}”.`,
        {
          actor,
          verb,
          entity: entityLabel,
          name: entityName
        }
      );
    }

    if (entityReference) {
      return safeT(
        'messages.businessWithId',
        `L’utilisateur ${actor} ${verb} ${entityLabel} (ID : ${entityReference}).`,
        {
          actor,
          verb,
          entity: entityLabel,
          id: entityReference
        }
      );
    }

    return safeT(
      'messages.businessSimple',
      `L’utilisateur ${actor} ${verb} ${entityLabel}.`,
      {
        actor,
        verb,
        entity: entityLabel
      }
    );
  }

  function getReadableDetails(log: AuditLog): DetailRow[] {
    const rows: DetailRow[] = [];
    const entityName = getEntityName(log);
    const entityReference = getEntityReference(log);

    rows.push({
      label: safeT('detailLabels.summary', 'Résumé'),
      value: getBusinessMessage(log)
    });

    if (entityName) {
      rows.push({
        label: safeT('detailLabels.name', 'Nom'),
        value: entityName
      });
    }

    if (entityReference) {
      rows.push({
        label: safeT('detailLabels.id', 'ID'),
        value: entityReference
      });
    }

    return rows;
  }

  function getChangeRows(log: AuditLog): DetailRow[] {
    const oldValue = isPlainObject(log.oldValue) ? log.oldValue : {};
    const newValue = isPlainObject(log.newValue) ? log.newValue : {};

    if (!Object.keys(oldValue).length && !Object.keys(newValue).length) {
      return [];
    }

    const ignoredKeys = new Set([
      'path',
      'query',
      'method',
      'params',
      'status',
      'durationMs',
      'message',
      'entityLabel',
      'body',
      'userAgent',
      'ipAddress',
      'password',
      'passwordHash',
      'password_hash',
      'accessToken',
      'refreshToken',
      'token'
    ]);

    const keys = Array.from(
      new Set([...Object.keys(oldValue), ...Object.keys(newValue)])
    ).filter((key) => !ignoredKeys.has(key));

    return keys
      .map((key) => {
        const oldText = stringifyValue(oldValue?.[key]);
        const newText = stringifyValue(newValue?.[key]);

        if (oldText === newText) {
          return null;
        }

        return {
          label: humanize(key),
          value: safeT(
            'detailLabels.changeValue',
            `${oldText || '-'} → ${newText || '-'}`,
            {
              oldValue: oldText || '-',
              newValue: newText || '-'
            }
          )
        };
      })
      .filter(Boolean) as DetailRow[];
  }

  function getEntityTypeLabel(entity: string) {
    const value = String(entity || '').toLowerCase();

    return safeT(`entityTypes.${value}`, humanize(entity));
  }

  function getEntityTypeSentenceLabel(entity: string) {
    const value = String(entity || '').toLowerCase();

    return safeT(`entitySentenceTypes.${value}`, getEntityTypeLabel(entity).toLowerCase());
  }

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));

  const paginatedLogs = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;

    return logs.slice(start, start + PAGE_SIZE);
  }, [logs, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [action, entityType]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const selectedLogData = useMemo(() => {
    if (!selectedLog) {
      return null;
    }

    return {
      date: formatDate(selectedLog.createdAt),
      user: getUserLabel(selectedLog),
      action: getActionLabel(selectedLog.action),
      actionClass: getActionBadgeClass(selectedLog.action),
      module: getEntityTypeLabel(selectedLog.entityType),
      message: getBusinessMessage(selectedLog),
      detailRows: getReadableDetails(selectedLog),
      changeRows: getChangeRows(selectedLog)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLog]);

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
                'Consultez les actions importantes effectuées sur la plateforme.'
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
                'groups, companies, farms...'
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
                    <th className="px-5 py-3">{safeT('table.summary', 'Résumé')}</th>
                    <th className="px-5 py-3 text-right">
                      {safeT('table.details', 'Détails')}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedLogs.map((log) => {
                    const userSecondaryLabel = getUserSecondaryLabel(log);
                    const entityName = getEntityName(log);
                    const entityReference = getEntityReference(log);

                    return (
                      <tr key={log.id} className="align-top hover:bg-slate-50/70">
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(log.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-950">
                            {getUserLabel(log)}
                          </div>

                          {userSecondaryLabel ? (
                            <div className="text-xs text-slate-500">
                              {userSecondaryLabel}
                            </div>
                          ) : null}
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
                          <div className="max-w-2xl text-sm font-medium text-slate-800">
                            {getBusinessMessage(log)}
                          </div>

                          {entityName || entityReference ? (
                            <div className="mt-1 text-xs text-slate-400">
                              {[
                                entityName
                                  ? `${safeT('detailLabels.name', 'Nom')} : ${entityName}`
                                  : '',
                                entityReference
                                  ? `${safeT('detailLabels.id', 'ID')} : ${entityReference}`
                                  : ''
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                          ) : null}
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 bg-slate-50/60 p-3 md:hidden">
              {paginatedLogs.map((log) => (
                <AuditLogMobileCard
                  key={log.id}
                  log={log}
                  date={formatDate(log.createdAt)}
                  actionLabel={getActionLabel(log.action)}
                  actionClass={getActionBadgeClass(log.action)}
                  userLabel={getUserLabel(log)}
                  message={getBusinessMessage(log)}
                  entityName={getEntityName(log)}
                  entityReference={getEntityReference(log)}
                  nameLabel={safeT('detailLabels.name', 'Nom')}
                  idLabel={safeT('detailLabels.id', 'ID')}
                  detailsLabel={safeT('details', 'Voir le détail')}
                  onOpen={() => setSelectedLog(log)}
                />
              ))}
            </div>

            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalItems={logs.length}
              pageSize={PAGE_SIZE}
              previousLabel={safeT('pagination.previous', 'Précédent')}
              nextLabel={safeT('pagination.next', 'Suivant')}
              rangeLabel={(start, end, total) =>
                safeT(
                  'pagination.range',
                  `Affichage de ${start} à ${end} sur ${total}`,
                  {start, end, total}
                )
              }
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {mounted && selectedLog && selectedLogData
        ? createPortal(
            <AuditLogDetailSheet
              title={safeT('details', 'Voir le détail')}
              closeLabel={safeT('close', 'Fermer')}
              date={selectedLogData.date}
              user={selectedLogData.user}
              action={selectedLogData.action}
              actionClass={selectedLogData.actionClass}
              module={selectedLogData.module}
              message={selectedLogData.message}
              detailRows={selectedLogData.detailRows}
              changeRows={selectedLogData.changeRows}
              summaryTitle={safeT('detailLabels.actionSummary', 'Résumé de l’action')}
              businessInfoTitle={safeT('detailLabels.businessInfo', 'Informations métier')}
              changesTitle={safeT('detailLabels.changes', 'Modifications')}
              emptyLabel={safeT('detailLabels.empty', 'Aucun détail complémentaire.')}
              dateLabel={safeT('detailLabels.date', 'Date')}
              userLabel={safeT('detailLabels.user', 'Utilisateur')}
              actionLabel={safeT('detailLabels.action', 'Action')}
              moduleLabel={safeT('detailLabels.module', 'Module')}
              onClose={() => setSelectedLog(null)}
            />,
            document.body
          )
        : null}
    </main>
  );
}

function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  previousLabel,
  nextLabel,
  rangeLabel,
  onPageChange
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  previousLabel: string;
  nextLabel: string;
  rangeLabel: (start: number, end: number, total: number) => string;
  onPageChange: (page: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div>{rangeLabel(start, end, totalItems)}</div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {previousLabel}
        </button>

        <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

function AuditLogMobileCard({
  log,
  date,
  actionLabel,
  actionClass,
  userLabel,
  message,
  entityName,
  entityReference,
  nameLabel,
  idLabel,
  detailsLabel,
  onOpen
}: {
  log: AuditLog;
  date: string;
  actionLabel: string;
  actionClass: string;
  userLabel: string;
  message: string;
  entityName: string;
  entityReference: string;
  nameLabel: string;
  idLabel: string;
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

          <h3 className="mt-2 line-clamp-3 text-base font-semibold text-slate-950">
            {message}
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

      {entityName || entityReference ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {entityName ? (
            <div>
              {nameLabel} : <span className="font-semibold text-slate-800">{entityName}</span>
            </div>
          ) : null}

          {entityReference ? (
            <div className={entityName ? 'mt-1' : ''}>
              {idLabel} : <span className="font-semibold text-slate-800">{entityReference}</span>
            </div>
          ) : null}
        </div>
      ) : null}

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
  title,
  closeLabel,
  date,
  user,
  action,
  actionClass,
  module,
  message,
  detailRows,
  changeRows,
  summaryTitle,
  businessInfoTitle,
  changesTitle,
  emptyLabel,
  dateLabel,
  userLabel,
  actionLabel,
  moduleLabel,
  onClose
}: {
  title: string;
  closeLabel: string;
  date: string;
  user: string;
  action: string;
  actionClass: string;
  module: string;
  message: string;
  detailRows: DetailRow[];
  changeRows: DetailRow[];
  summaryTitle: string;
  businessInfoTitle: string;
  changesTitle: string;
  emptyLabel: string;
  dateLabel: string;
  userLabel: string;
  actionLabel: string;
  moduleLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/40">
      <button
        type="button"
        className="absolute inset-0 hidden cursor-default lg:block"
        onClick={onClose}
        aria-label={closeLabel}
      />

      <aside className="absolute inset-y-0 right-0 flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-w-xl">
        <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">{title}</p>

              <h2 className="mt-1 truncate text-xl font-semibold text-slate-950">
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
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <FileText size={15} />
                <span>{summaryTitle}</span>
              </div>

              <p className="text-sm leading-6 text-slate-800">
                {message || '-'}
              </p>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <InfoTile icon={<CalendarClock size={17} />} label={dateLabel} value={date} />
              <InfoTile icon={<User size={17} />} label={userLabel} value={user} />
              <InfoTile icon={<ShieldCheck size={17} />} label={actionLabel} value={action} badgeClass={actionClass} />
              <InfoTile icon={<FileText size={17} />} label={moduleLabel} value={module} />
            </section>

            <section className="rounded-2xl border border-slate-200">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  {businessInfoTitle}
                </h3>
              </div>

              {detailRows.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {detailRows.map((row, index) => (
                    <DetailLine
                      key={`${row.label}-${index}`}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-sm text-slate-500">
                  {emptyLabel}
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
                  {changeRows.map((row, index) => (
                    <DetailLine
                      key={`${row.label}-${index}`}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  badgeClass
}: {
  icon: ReactNode;
  label: string;
  value: string;
  badgeClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        <span>{label}</span>
      </div>

      {badgeClass ? (
        <span
          className={[
            'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
            badgeClass
          ].join(' ')}
        >
          {value || '-'}
        </span>
      ) : (
        <div className="break-words text-sm font-semibold text-slate-950">
          {value || '-'}
        </div>
      )}
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

function formatEmailAsName(email?: string | null) {
  if (!email) {
    return '';
  }

  const localPart = email.split('@')[0] || '';

  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function normalizePersonName(firstName?: string | null, lastName?: string | null) {
  const cleanFirstName = String(firstName || '').trim();
  const cleanLastName = String(lastName || '').trim();

  const ignoredLastNames = new Set(['cropcontrole', 'crop control', 'agricontrol', 'agri control']);

  const safeLastName = ignoredLastNames.has(cleanLastName.toLowerCase())
    ? ''
    : cleanLastName;

  return `${cleanFirstName} ${safeLastName}`.trim();
}