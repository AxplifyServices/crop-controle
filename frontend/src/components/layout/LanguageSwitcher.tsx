'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';

const languages = [
  {value: 'fr', label: 'FR'},
  {value: 'en', label: 'EN'},
  {value: 'es', label: 'ES'}
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function changeLocale(nextLocale: string) {
    router.replace(pathname, {locale: nextLocale});
  }

  return (
    <div className="flex items-center rounded-full bg-slate-100 p-0.5">
      {languages.map((language) => (
        <button
          key={language.value}
          type="button"
          onClick={() => changeLocale(language.value)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
            locale === language.value
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-white'
          }`}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}