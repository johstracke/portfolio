export const SUPPORTED_LOCALES = ['en', 'de'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return DEFAULT_LOCALE;
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function withLocalePath(locale: Locale, path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path;
  }
  if (!path.startsWith('/')) {
    return `/${locale}/${path}`;
  }
  if (path === '/') {
    return `/${locale}`;
  }
  if (/^\/(en|de)(\/|$)/.test(path)) {
    return path;
  }
  return `/${locale}${path}`;
}

export function toDirectusLocale(locale: Locale): 'en-US' | 'de-DE' {
  return locale === 'de' ? 'de-DE' : 'en-US';
}
