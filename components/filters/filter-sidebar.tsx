'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type FilterOption = {
  label: string;
  value: string;
};

type FilterSidebarProps = {
  domains: string[];
  statuses: string[];
  tags: FilterOption[];
  selectedDomain?: string;
  selectedStatus?: string;
  selectedTag?: string;
};

export function FilterSidebar({
  domains,
  statuses,
  tags,
  selectedDomain,
  selectedStatus,
  selectedTag,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function clearFilters() {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('domain');
    nextParams.delete('status');
    nextParams.delete('tag');
    nextParams.delete('search');
    router.push(pathname);
  }

  return (
    <aside className="space-y-5 border-[3px] border-black bg-surface p-5 shadow-brutal-sm">
      <div>
        <h2 className="text-xl font-bold">Filter Projects</h2>
        <p className="mt-1 text-sm text-ink/70">
          Refine by domain, status, and tag.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase text-ink/70">Domain</span>
        <select
          value={selectedDomain ?? ''}
          onChange={(event) => updateParam('domain', event.target.value)}
          className="w-full border-[3px] border-black bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <option value="">All domains</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase text-ink/70">Status</span>
        <select
          value={selectedStatus ?? ''}
          onChange={(event) => updateParam('status', event.target.value)}
          className="w-full border-[3px] border-black bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase text-ink/70">Tag</span>
        <select
          value={selectedTag ?? ''}
          onChange={(event) => updateParam('tag', event.target.value)}
          className="w-full border-[3px] border-black bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.value} value={tag.value}>
              {tag.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={clearFilters}
        className="w-full border-[3px] border-black bg-secondary px-4 py-2 text-sm font-bold uppercase text-white shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
      >
        Clear Filters
      </button>
    </aside>
  );
}
