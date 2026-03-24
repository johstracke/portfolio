import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale, SUPPORTED_LOCALES } from '@/lib/i18n';

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'de' }];
}

export const metadata: Metadata = {
  alternates: {
    languages: {
      en: 'https://johannesjohannes.de/en',
      de: 'https://johannesjohannes.de/de',
      'x-default': 'https://johannesjohannes.de',
    },
  },
};

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return children;
}
