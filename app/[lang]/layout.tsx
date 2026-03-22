import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'de' }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return children;
}
