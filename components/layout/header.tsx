import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b-[3px] border-black bg-surface">
      <nav className="container mx-auto px-4 py-4 flex gap-6">
        <Link href="/" className="font-bold hover:underline">
          Home
        </Link>
        <Link href="/projects" className="font-bold hover:underline">
          Projects
        </Link>
        <Link href="/blog" className="font-bold hover:underline">
          Blog
        </Link>
        <Link href="/about" className="font-bold hover:underline">
          About
        </Link>
        <Link href="/now" className="font-bold hover:underline">
          Now
        </Link>
      </nav>
    </header>
  );
}
