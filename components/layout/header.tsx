'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/now', label: 'Now' },
] as const;

export function Header() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b-[3px] border-black bg-surface">
      <nav className="container mx-auto px-4 py-4 flex flex-wrap gap-4 sm:gap-6">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={[
              'font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm',
              isActive(href)
                ? 'underline decoration-primary decoration-[3px] underline-offset-4'
                : 'hover:underline',
            ].join(' ')}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
