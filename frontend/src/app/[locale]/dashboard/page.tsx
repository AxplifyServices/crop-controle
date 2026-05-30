import {
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  TrendingUp
} from 'lucide-react';
import {useTranslations} from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  const cards = [
    {
      label: t('production'),
      value: '0 kg',
      icon: PackageCheck
    },
    {
      label: t('cost'),
      value: '0 MAD',
      icon: CircleDollarSign
    },
    {
      label: t('margin'),
      value: '0%',
      icon: TrendingUp
    },
    {
      label: t('quality'),
      value: '0/100',
      icon: BarChart3
    }
  ];

  return (
    <>
      <div className="mb-7">
        <p className="text-[14px] font-medium text-slate-500">{t('date')}</p>
        <h1 className="mt-1 text-[34px] font-semibold tracking-tight text-slate-950">
          {t('title')}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon size={24} />
                </div>

                <div>
                  <p className="text-[13px] font-semibold uppercase text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-[28px] font-semibold text-slate-950">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <AlertTriangle size={20} />
            <h2 className="text-[20px] font-semibold text-slate-950">
              {t('incidents')}
            </h2>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-[14px] text-slate-500">
            {t('empty')}
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-8 text-[20px] font-semibold text-slate-950">
            {t('activeModules')}
          </h2>

          <div className="space-y-3">
            {[
              'Production agricole',
              'Flux ferme → usine',
              'Conditionnement'
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">{item}</p>
                  <p className="text-[13px] text-slate-500">Agri-Control</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700">
                  Actif
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}