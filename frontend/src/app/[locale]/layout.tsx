import type {Metadata} from 'next';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {AgentationClient} from '@/components/dev/AgentationClient';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Agri-Control',
  description: 'Plateforme de pilotage agricole',
  manifest: '/manifest.json',
  themeColor: '#047857'
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
          <AgentationClient />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}