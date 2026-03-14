import type { Metadata } from 'next';
import { getProjects } from '@/lib/directus';
import { FilterSidebar } from '@/components/filters/filter-sidebar';
import { SearchBar } from '@/components/filters/search-bar';
import { ProjectCard } from '@/components/cards/project-card';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Browse hardware, software, automation, and interdisciplinary work.',
};

type Props = {
  searchParams: Promise<{
    domain?: string;
    tag?: string;
    status?: string;
    context?: string;
    search?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [allProjects, filteredProjects] = await Promise.all([
    getProjects(),
    getProjects({
      domain: params.domain,
      tag: params.tag,
      status: params.status,
      context: params.context,
      search: params.search,
    }),
  ]);

  const domains = Array.from(
    new Set(allProjects.flatMap((project) => project.domains ?? []))
  ).sort();
  const statuses = Array.from(new Set(allProjects.map((project) => project.status))).sort();
  const tags = Array.from(
    new Map(
      allProjects
        .flatMap((project) => project.tags ?? [])
        .map((tag) => [tag.slug, { label: tag.name, value: tag.slug }])
    ).values()
  ).sort((left, right) => left.label.localeCompare(right.label));
  const contexts = Array.from(
    new Set(
      allProjects
        .map((p) => p.context)
        .filter((c) => c != null)
        .map(String)
    )
  ).sort();
  const activeFilters = [params.domain, params.status, params.tag, params.context, params.search]
    .filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display mb-3 text-4xl font-bold">Projects</h1>
        <p className="mb-5 max-w-2xl text-ink/80">
          Browse hardware, software, automation, and interdisciplinary work.
        </p>
        <SearchBar initialValue={params.search} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <FilterSidebar
          domains={domains}
          statuses={statuses}
          tags={tags}
          contexts={contexts}
          selectedDomain={params.domain}
          selectedStatus={params.status}
          selectedTag={params.tag}
          selectedContext={params.context}
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
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
