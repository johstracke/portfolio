import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjects } from '@/lib/directus';
import {
  countActiveProjectFilters,
  deriveProjectFacets,
  filterProjects,
  normalizeProjectFilters,
  type ProjectSearchParams,
} from '@/lib/project-filters';
import { FilterSidebar } from '@/components/filters/filter-sidebar';
import { SearchBar } from '@/components/filters/search-bar';
import { ProjectCard } from '@/components/cards/project-card';
import { isLocale, type Locale, SUPPORTED_LOCALES } from '@/lib/i18n';

const METADATA = {
  en: {
    title: 'Projects',
    description: 'Browse hardware, software, automation, and interdisciplinary work.',
  },
  de: {
    title: 'Projekte',
    description: 'Erkunden Sie Hardware-, Software-, Automatisierungs- und interdisziplinäre Projekte.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : 'en';
  const meta = METADATA[locale] || METADATA.en;

  const alternates = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `https://johannesjohannes.de/${l}/projects`])
  );

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: alternates,
      canonical: `https://johannesjohannes.de/${locale}/projects`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
  };
}

type Props = {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<ProjectSearchParams>;
};

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const locale = lang as Locale;
  const rawSearchParams = searchParams ? await searchParams : undefined;
  const filters = normalizeProjectFilters(rawSearchParams);
  const allProjects = await getProjects(filters, locale);
  const filteredProjects = filterProjects(allProjects, filters);
  const { domains, statuses, tags, contexts } = deriveProjectFacets(allProjects);
  const activeFilters = countActiveProjectFilters(filters);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display mb-3 text-4xl font-bold">Projects</h1>
        <p className="mb-5 max-w-2xl text-ink/80">
          Browse hardware, software, automation, and interdisciplinary work.
        </p>
        <SearchBar initialValue={filters.search} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <FilterSidebar
          domains={domains}
          statuses={statuses}
          tags={tags}
          contexts={contexts}
          selectedDomain={filters.domain}
          selectedStatus={filters.status}
          selectedTag={filters.tag}
          selectedContext={filters.context}
        />

        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold uppercase text-ink/70">
              {filteredProjects.length} result{filteredProjects.length === 1 ? '' : 's'}
            </p>
            {activeFilters > 0 ? (
              <p className="text-sm text-ink/70">
                {activeFilters} filter{activeFilters === 1 ? '' : 's'} active
              </p>
            ) : null}
          </div>

          {filteredProjects.length === 0 ? (
            <p className="text-ink/80">
              No projects match the current filters. Adjust the controls or add content in Directus.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
