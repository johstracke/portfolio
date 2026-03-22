'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import { t } from '@/lib/ui-translations';

export function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname || '/');

  return (
    <footer className="border-t-[3px] border-black bg-surface mt-auto">
      <div className="container mx-auto px-4 py-6 text-sm text-ink/70">
        © {new Date().getFullYear()} {t(locale, 'footer.copyright')}
      </div>
    </footer>
  );
}
