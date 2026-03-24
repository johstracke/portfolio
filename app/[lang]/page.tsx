import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProfile, getProjects, getBlogPosts } from '@/lib/directus';
import { Button } from '@/components/shared/button';
import { getAssetUrl } from '@/lib/schemas';
import { formatDate } from '@/lib/utils';
import { isLocale, type Locale, withLocalePath, SUPPORTED_LOCALES } from '@/lib/i18n';

const DESCRIPTIONS = {
  en: 'Portfolio showcasing hardware, software, automation, and sustainable systems.',
  de: 'Portfolio mit Projekten zu Hardware, Software, Automatisierung und nachhaltigen Systemen.',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as Locale;
  const description = DESCRIPTIONS[locale] || DESCRIPTIONS.en;
  const alternates = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `https://johannesjohannes.de/${l}`])
  );

  return {
    description,
    alternates: {
      languages: {
        ...alternates,
        'x-default': 'https://johannesjohannes.de',
      },
      canonical: `https://johannesjohannes.de/${locale}`,
    },
    openGraph: {
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
  };
}

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: string }>;
};

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : ts;
}

function inferProjectType(domains: string[] | null | undefined) {
  const normalized = (domains ?? []).map((d) => d.toLowerCase());
  if (normalized.some((d) => d.includes('hardware') || d.includes('embedded') || d.includes('mechanical'))) {
    return 'HARDWARE';
  }
  if (normalized.some((d) => d.includes('software') || d.includes('web') || d.includes('automation'))) {
    return 'SOFTWARE';
  }
  return 'SYSTEMS';
}

function toYear(dateValue: string | null | undefined) {
  const ts = toTimestamp(dateValue);
  if (!ts) return 'N/A';
  return new Date(ts).getFullYear().toString();
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const locale = lang as Locale;
  const [profile, projects, blogPosts] = await Promise.all([
    getProfile(locale),
    getProjects(undefined, locale),
    getBlogPosts(5, locale),
  ]);
  const featuredProjects = projects.slice(0, 3);
  const heroCutouts = [
    {
      label: 'CNC PART',
      caption: 'custom aluminum mount',
      image: '/mock-cnc-part.svg',
      className: 'right-2 top-3 rotate-[-12deg] animate-float',
    },
    {
      label: 'CIRCUIT BOARD',
      caption: 'sensor + control stack',
      image: '/mock-circuit-board.svg',
      className: 'right-0 bottom-4 rotate-[10deg] animate-float-delay',
    },
    {
      label: 'CAD SCREENSHOT',
      caption: 'iterative fit-check pass',
      image: '/mock-cad-screen.svg',
      className: 'right-44 top-32 rotate-[7deg] animate-float hidden xl:block',
    },
  ] as const;

  const recentActivity = [
    ...blogPosts.map((p) => ({ type: 'blog' as const, item: p, date: p.published_date })),
    ...projects.slice(0, 5).map((p) => ({
      type: 'project' as const,
      item: p,
      date: p.date_updated ?? p.date_created ?? p.start_date,
    })),
  ]
    .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date))
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <section className="relative isolate overflow-hidden py-6 md:py-8">
        <div className="relative mx-auto min-h-[320px] max-w-6xl px-1 md:min-h-[410px]">
          <div className="max-w-[42rem] border-[3px] border-black bg-surface/95 p-6 shadow-brutal backdrop-blur-sm md:p-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-ink/70">Johannes Stracke</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Building hardware, software, and systems that solve real problems.
            </h1>
            <p className="mt-4 text-sm font-medium uppercase tracking-wide text-ink/70">
              Hands-on engineering from concept to deployment.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
            {profile?.current_location && (
              <span className="border-[3px] border-black bg-surface px-3 py-1 text-sm font-bold shadow-brutal-sm">
                📍 {profile.current_location}
                {profile.next_location && ` → ${profile.next_location}`}
              </span>
            )}
            {profile?.availability_status && (
              <span className="border-[3px] border-black bg-primary px-3 py-1 text-sm font-bold shadow-brutal-sm">
                {profile.availability_status}
              </span>
            )}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button href={withLocalePath(locale, '/projects')}>View Projects</Button>
              <Button href={withLocalePath(locale, '/about')} variant="outline">About Me</Button>
            </div>
          </div>

          {heroCutouts.map((cutout) => (
            <div
              key={cutout.label}
              className={`absolute z-10 hidden w-56 overflow-hidden border-[3px] border-black bg-surface shadow-brutal md:block lg:w-64 xl:w-72 ${cutout.className}`}
            >
              <div className="relative aspect-[4/3] border-b-[3px] border-black bg-accent/20">
                <Image
                  src={cutout.image}
                  alt={cutout.label}
                  fill
                  className="object-cover"
                  sizes="208px"
                />
              </div>
              <div className="p-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/70">{cutout.label}</p>
                <p className="mt-0.5 text-xs font-medium">{cutout.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section className="py-12 md:py-16">
          <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">Featured Work</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={withLocalePath(locale, `/projects/${project.slug}`)}
                className="group block border-[3px] border-black bg-surface shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b-[3px] border-black bg-accent/30">
                  <Image
                    src={getAssetUrl(project.thumbnail)}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold leading-tight">{project.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/80">{project.short_summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="border-[2px] border-black bg-ink px-2 py-0.5 text-xs font-bold text-white">
                      {inferProjectType(project.domains)}
                    </span>
                    <span className="border-[2px] border-black bg-surface px-2 py-0.5 text-xs font-bold">
                      {toYear(project.start_date)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href={withLocalePath(locale, '/projects')} variant="secondary">All Projects</Button>
          </div>
        </section>
      )}

      {recentActivity.length > 0 && (
        <section className="border-t-[3px] border-black py-12 md:py-16">
          <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.slice(0, 4).map((entry) =>
              entry.type === 'blog' ? (
                <Link
                  key={`blog-${entry.item.id}`}
                  href={withLocalePath(locale, `/blog/${entry.item.slug}`)}
                  className="block border-[3px] border-black bg-surface p-5 shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <p className="text-base font-bold">Blog: {entry.item.title}</p>
                  <p className="mt-1 text-sm text-ink/70">{formatDate(entry.item.published_date)}</p>
                </Link>
              ) : (
                <Link
                  key={`project-${entry.item.id}`}
                  href={withLocalePath(locale, `/projects/${entry.item.slug}`)}
                  className="block border-[3px] border-black bg-surface p-5 shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <p className="text-base font-bold">Updated: {entry.item.title}</p>
                  <p className="mt-1 text-sm text-ink/70">
                    {formatDate(entry.item.date_updated ?? entry.item.date_created ?? entry.item.start_date ?? undefined)}
                  </p>
                </Link>
              )
            )}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href={withLocalePath(locale, '/blog')} variant="outline">Blog</Button>
            <Button href={withLocalePath(locale, '/projects')} variant="outline">Projects</Button>
          </div>
        </section>
      )}
    </div>
  );
}
