import {Leaf, Sprout, Tractor} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {LoginForm} from '@/components/auth/LoginForm';
import {LanguageSwitcher} from '@/components/layout/LanguageSwitcher';
import {LoginRedirect} from '@/components/auth/LoginRedirect';

export default function LoginPage() {
  const tApp = useTranslations('App');
  const tAuth = useTranslations('Auth');

  return (
    <main className="grid min-h-screen grid-cols-1 bg-slate-100 lg:grid-cols-2">
      <LoginRedirect />
      <section className="relative hidden overflow-hidden bg-[#d8f0a7] p-12 lg:block">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
            <Leaf size={24} />
          </div>

          <div>
            <h1 className="text-[24px] font-semibold text-slate-950">
              {tApp('name')}
            </h1>
            <p className="text-[14px] text-emerald-900">
              {tApp('subtitle')}
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-10 opacity-35">
          <div className="flex h-64 w-56 items-center justify-center rounded-[2rem] bg-emerald-900/15">
            <Tractor size={120} className="text-emerald-900" strokeWidth={1.6} />
          </div>

          <div className="space-y-8">
            <div className="flex h-32 w-56 items-center justify-center rounded-[2rem] bg-emerald-900/15">
              <Sprout size={80} className="text-emerald-900" strokeWidth={1.6} />
            </div>
            <div className="h-28 w-56 rounded-[2rem] bg-emerald-900/15" />
          </div>
        </div>

        <p className="absolute bottom-10 left-12 text-[14px] text-emerald-950/75">
          {tApp('subtitle')}
        </p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center p-6">
        <div className="absolute right-6 top-6">
          <LanguageSwitcher />
        </div>

        <div className="absolute left-6 top-6 flex items-center gap-3 lg:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
            <Leaf size={22} />
          </div>

          <div>
            <h1 className="text-[20px] font-semibold text-slate-950">
              {tApp('name')}
            </h1>
            <p className="text-[12px] text-emerald-900">
              {tApp('subtitle')}
            </p>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <h2 className="text-[28px] font-semibold leading-tight text-slate-950">
            {tAuth('loginTitle')}
          </h2>

          <p className="mt-2 text-[14px] text-slate-500">
            {tAuth('loginSubtitle')}
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}