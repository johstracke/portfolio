import type { Locale } from '@/lib/i18n';

const messages = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      blog: 'Blog',
      about: 'About',
      now: 'Now',
    },
    filters: {
      title: 'Filter Projects',
      subtitle: 'Refine by domain, status, and tag.',
      domain: 'Domain',
      status: 'Status',
      tag: 'Tag',
      context: 'Context',
      allDomains: 'All domains',
      allStatuses: 'All statuses',
      allTags: 'All tags',
      allContexts: 'All contexts',
      clear: 'Clear Filters',
      searchPlaceholder: 'Search by title or summary',
      searchButton: 'Search',
    },
    footer: {
      copyright: 'Portfolio',
    },
    language: {
      label: 'Language',
    },
  },
  de: {
    nav: {
      home: 'Startseite',
      projects: 'Projekte',
      blog: 'Blog',
      about: 'Uber mich',
      now: 'Jetzt',
    },
    filters: {
      title: 'Projekte filtern',
      subtitle: 'Nach Bereich, Status und Schlagwort verfeinern.',
      domain: 'Bereich',
      status: 'Status',
      tag: 'Schlagwort',
      context: 'Kontext',
      allDomains: 'Alle Bereiche',
      allStatuses: 'Alle Status',
      allTags: 'Alle Schlagworter',
      allContexts: 'Alle Kontexte',
      clear: 'Filter zurucksetzen',
      searchPlaceholder: 'Nach Titel oder Zusammenfassung suchen',
      searchButton: 'Suchen',
    },
    footer: {
      copyright: 'Portfolio',
    },
    language: {
      label: 'Sprache',
    },
  },
} as const;

export function t(locale: Locale, key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((current, part) => {
      if (current && typeof current === 'object' && part in current) {
        return (current as Record<string, unknown>)[part];
      }
      return undefined;
    }, messages[locale]);

  return typeof value === 'string' ? value : key;
}
