import {redirect} from '@/i18n/navigation';

export default function HomePage({
  params
}: {
  params: {locale: string};
}) {
  redirect({
    href: '/login',
    locale: params.locale
  });
}