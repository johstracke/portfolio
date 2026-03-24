import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/shared/badge';
import { Button } from '@/components/shared/button';
import { getProfile, getProjects } from '@/lib/directus';
import { formatDate } from '@/lib/utils';
import { isLocale, withLocalePath, SUPPORTED_LOCALES } from '@/lib/i18n';

const METADATA = {
  en: {
    title: 'Now',
    description: 'Current status, availability, and what I\'m working on.',
  },
  de: {
    title: 'Jetzt',
    description: 'Aktueller Status, Verfügbarkeit und aktuelle Projekte.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : 'en';
  const meta = METADATA[locale] || METADATA.en;

  const alternates = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `https://johannesjohannes.de/${l}/now`])
  );

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: alternates,
      canonical: `https://johannesjohannes.de/${locale}/now`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
  };
}

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function NowPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const [profile, projects] = await Promise.all([getProfile(lang), getProjects(undefined, lang)]);
  const activeProjects = projects.filter((project) => project.status === 'ongoing').slice(0, 3);
  const latestProjects = projects.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 max-w-3xl">
        <h1 className="font-display mb-6 text-4xl font-bold md:text-5xl">Now</h1>
        <p className="text-lg leading-8 text-ink/85">
          This page captures what is current right now: location, availability, and the work
          currently getting attention.
        </p>
      </section>

      <section className="mb-12 grid gap-6 md:grid-cols-3">
        <div className="border-[3px] border-black bg-surface p-6 shadow-brutal-sm">
          <p className="mb-2 text-sm font-bold uppercase text-ink/70">Current location</p>
          <p className="text-2xl font-bold">{profile?.current_location ?? 'Set in Directus'}</p>
        </div>
        <div className="border-[3px] border-black bg-surface p-6 shadow-brutal-sm">
          <p className="mb-2 text-sm font-bold uppercase text-ink/70">Next stop</p>
          <p className="text-2xl font-bold">
            {profile?.next_location ?? 'Set in Directus'}
          </p>
          {profile?.next_location && profile?.location_change_date && (
            <p className="mt-1 text-sm text-ink/60">
              Moving {formatDate(profile.location_change_date ?? undefined)}
            </p>
          )}
        </div>
        <div className="border-[3px] border-black bg-primary p-6 text-ink shadow-brutal-sm">
          <p className="mb-2 text-sm font-bold uppercase text-ink/70">Availability</p>
          <p className="text-base font-bold">
            {profile?.availability_status ?? 'Update availability in Directus'}
          </p>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Current Focus</h2>
          <Button href={withLocalePath(lang, '/projects')} variant="outline">Browse Projects</Button>
        </div>
        {activeProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {activeProjects.map((project) => (
              <Link
                key={project.id}
                href={withLocalePath(lang, `/projects/${project.slug}`)}
                className="block border-[3px] border-black bg-surface p-5 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="primary">{project.status}</Badge>
                  {project.domains?.slice(0, 2).map((domain) => (
                    <Badge key={domain}>{domain}</Badge>
                  ))}
                </div>
                <h3 className="mb-2 text-xl font-bold">{project.title}</h3>
                <p className="text-sm text-ink/80">{project.short_summary}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-ink/80">
            No ongoing projects yet. Mark projects as <code>ongoing</code> in Directus to feature
            them here.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Recent Updates</h2>
        {latestProjects.length > 0 ? (
          <div className="space-y-4">
            {latestProjects.map((project) => (
              <Link
                key={project.id}
                href={withLocalePath(lang, `/projects/${project.slug}`)}
                className="flex flex-col gap-3 border-[3px] border-black bg-surface p-5 shadow-brutal-sm md:flex-row md:items-center md:justify-between hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div>
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <p className="text-sm text-ink/80">
                    Started {formatDate(project.start_date ?? undefined)}
                    {project.end_date ? `, updated through ${formatDate(project.end_date ?? undefined)}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-ink/80">Add projects in Directus to make this page feel current.</p>
        )}
      </section>
    </div>
  );
}
