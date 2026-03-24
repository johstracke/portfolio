'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getLocaleFromPathname, withLocalePath, type Locale } from '@/lib/i18n';
import { t } from '@/lib/ui-translations';

const LOCALE_SWITCH_SCROLL_KEY = 'locale-switch-scroll-y';

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/projects', labelKey: 'nav.projects' },
  { href: '/blog', labelKey: 'nav.blog' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/now', labelKey: 'nav.now' },
] as const;

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname || '/');

  useEffect(() => {
    const pendingScroll = window.sessionStorage.getItem(LOCALE_SWITCH_SCROLL_KEY);
    if (!pendingScroll) return;

    const y = Number.parseInt(pendingScroll, 10);
    if (Number.isNaN(y)) {
      window.sessionStorage.removeItem(LOCALE_SWITCH_SCROLL_KEY);
      return;
    }

    let attempts = 0;
    const maxAttempts = 12;
    const tryRestore = () => {
      window.scrollTo({ top: y, behavior: 'auto' });
      const delta = Math.abs(window.scrollY - y);
      attempts += 1;

      // Stop once we're close enough, or after a short retry window.
      if (delta <= 2 || attempts >= maxAttempts) {
        window.sessionStorage.removeItem(LOCALE_SWITCH_SCROLL_KEY);
        return;
      }

      window.setTimeout(tryRestore, 60);
    };

    requestAnimationFrame(tryRestore);
  }, [pathname, searchParams]);

  function isActive(href: string) {
    const localizedHref = withLocalePath(locale, href);
    if (href === '/') return pathname === localizedHref;
    return (pathname || '').startsWith(localizedHref);
  }

  function switchLocale(nextLocale: Locale) {
    const currentPath = pathname || '/';
    const withoutLocale = currentPath.replace(/^\/(en|de)(?=\/|$)/, '') || '/';
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    window.sessionStorage.setItem(LOCALE_SWITCH_SCROLL_KEY, String(window.scrollY));
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    router.push(`${withLocalePath(nextLocale, withoutLocale)}${search}${hash}`, { scroll: false });
  }

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-black bg-surface">
      <nav className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-4 sm:gap-6">
        {NAV_LINKS.map(({ href, labelKey }) => (
          <Link
            key={href}
            href={withLocalePath(locale, href)}
            className={[
              'font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm',
              isActive(href)
                ? 'underline decoration-primary decoration-[3px] underline-offset-4'
                : 'hover:underline',
            ].join(' ')}
          >
            {t(locale, labelKey)}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2 border-[3px] border-black px-2 py-1">
          <span className="text-xs font-bold uppercase text-ink/70">{t(locale, 'language.label')}</span>
          <button
            type="button"
            onClick={() => switchLocale('en')}
            className={`px-2 py-1 text-xs font-bold uppercase ${locale === 'en' ? 'bg-black text-white' : 'hover:underline'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => switchLocale('de')}
            className={`px-2 py-1 text-xs font-bold uppercase ${locale === 'de' ? 'bg-black text-white' : 'hover:underline'}`}
          >
            DE
          </button>
        </div>
      </nav>
    </header>
  );
}
