'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {login, saveSession} from '@/lib/auth';

export function LoginForm() {
  const t = useTranslations('Auth');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
        saveSession(data);
        router.replace('/dashboard');
    } catch {
       setError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      <div>
        <label className="mb-2 block text-[14px] font-semibold text-slate-900">
          {t('email')}
        </label>

        <input
          type="email"
          name="agri-control-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-[52px] w-full rounded-2xl border border-slate-300 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          placeholder="nom@agri-control.com"
          autoComplete="off"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-[14px] font-semibold text-slate-900">
          {t('password')}
        </label>

        <input
          type="password"
          name="agri-control-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-[52px] w-full rounded-2xl border border-slate-300 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          placeholder="••••••••••"
          autoComplete="new-password"
          required
        />
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="h-[50px] w-full rounded-2xl bg-emerald-600 text-[15px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t('loading') : t('submit')}
      </button>
    </form>
  );
}