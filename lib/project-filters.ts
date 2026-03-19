import type { Project } from '@/types';

export type ProjectFilters = {
  domain?: string;
  tag?: string;
  status?: string;
  context?: string;
  search?: string;
};

export type ProjectTagOption = {
  label: string;
  value: string;
};

export type ProjectFacets = {
  domains: string[];
  statuses: string[];
  tags: ProjectTagOption[];
  contexts: string[];
};

type SearchParamValue = string | string[] | undefined;

export type ProjectSearchParams = {
  domain?: SearchParamValue;
  tag?: SearchParamValue;
  status?: SearchParamValue;
  context?: SearchParamValue;
  search?: SearchParamValue;
};

function normalizeParam(value: SearchParamValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeProjectFilters(params?: ProjectSearchParams): ProjectFilters {
  return {
    domain: normalizeParam(params?.domain),
    tag: normalizeParam(params?.tag),
    status: normalizeParam(params?.status),
    context: normalizeParam(params?.context),
    search: normalizeParam(params?.search),
  };
}

function normalizeText(value?: string | null): string {
  return (value ?? '').toLowerCase();
}

export function projectMatchesFilters(project: Project, filters: ProjectFilters): boolean {
  if (filters.status && project.status !== filters.status) {
    return false;
  }

  if (filters.domain && !(project.domains ?? []).includes(filters.domain)) {
    return false;
  }

  if (filters.tag && !(project.tags ?? []).some((tag) => tag.slug === filters.tag)) {
    return false;
  }

  if (filters.context && project.context !== filters.context) {
    return false;
  }

  if (filters.search) {
    const needle = filters.search.toLowerCase();
    const haystack = [
      normalizeText(project.title),
      normalizeText(project.short_summary),
      normalizeText(project.slug),
    ];
    if (!haystack.some((field) => field.includes(needle))) {
      return false;
    }
  }

  return true;
}

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  return projects.filter((project) => projectMatchesFilters(project, filters));
}

export function countActiveProjectFilters(filters: ProjectFilters): number {
  return [filters.domain, filters.status, filters.tag, filters.context, filters.search].filter(
    Boolean
  ).length;
}

export function deriveProjectFacets(projects: Project[]): ProjectFacets {
  const domains = Array.from(
    new Set(projects.flatMap((project) => project.domains ?? []))
  ).sort();

  const statuses = Array.from(new Set(projects.map((project) => project.status))).sort();

  const tags = Array.from(
    new Map(
      projects
        .flatMap((project) => project.tags ?? [])
        .map((tag) => [tag.slug, { label: tag.name, value: tag.slug }])
    ).values()
  ).sort((left, right) => left.label.localeCompare(right.label));

  const contexts = Array.from(
    new Set(
      projects
        .map((project) => project.context)
        .filter((context) => context != null)
        .map(String)
    )
  ).sort();

  return {
    domains,
    statuses,
    tags,
    contexts,
  };
}