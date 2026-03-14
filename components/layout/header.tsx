import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b-[3px] border-black bg-surface">
      <nav className="container mx-auto px-4 py-4 flex flex-wrap gap-4 sm:gap-6">
        <Link
          href="/"
          className="font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Home
        </Link>
        <Link
          href="/projects"
          className="font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Projects
        </Link>
        <Link
          href="/blog"
          className="font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Blog
        </Link>
        <Link
          href="/about"
          className="font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          About
        </Link>
        <Link
          href="/now"
          className="font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Now
        </Link>
      </nav>
    </header>
  );
}
