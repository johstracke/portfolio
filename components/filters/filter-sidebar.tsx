'use client';

import { usePathname } from 'next/navigation';
import { useProjectQueryUpdater } from '@/components/filters/use-project-query-updater';
import { getLocaleFromPathname } from '@/lib/i18n';
import { t } from '@/lib/ui-translations';

type FilterOption = {
  label: string;
  value: string;
};

type FilterSidebarProps = {
  domains: string[];
  statuses: string[];
  tags: FilterOption[];
  contexts: string[];
  selectedDomain?: string;
  selectedStatus?: string;
  selectedTag?: string;
  selectedContext?: string;
};

export function FilterSidebar({
  domains,
  statuses,
  tags,
  contexts,
  selectedDomain,
  selectedStatus,
  selectedTag,
  selectedContext,
}: FilterSidebarProps) {
  const { setFilter, clearFilters } = useProjectQueryUpdater();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname || '/');

  return (
    <aside className="space-y-5 border-[3px] border-black bg-surface p-5 shadow-brutal-sm">
      <div>
        <h2 className="text-xl font-bold">{t(locale, 'filters.title')}</h2>
        <p className="mt-1 text-sm text-ink/70">
          {t(locale, 'filters.subtitle')}
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase text-ink/70">{t(locale, 'filters.domain')}</span>
        <select
          value={selectedDomain ?? ''}
          onChange={(event) => setFilter('domain', event.target.value)}
          className="w-full border-[3px] border-black bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <option value="">{t(locale, 'filters.allDomains')}</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase text-ink/70">{t(locale, 'filters.status')}</span>
        <select
          value={selectedStatus ?? ''}
          onChange={(event) => setFilter('status', event.target.value)}
          className="w-full border-[3px] border-black bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <option value="">{t(locale, 'filters.allStatuses')}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase text-ink/70">{t(locale, 'filters.tag')}</span>
        <select
          value={selectedTag ?? ''}
          onChange={(event) => setFilter('tag', event.target.value)}
          className="w-full border-[3px] border-black bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <option value="">{t(locale, 'filters.allTags')}</option>
          {tags.map((tag) => (
            <option key={tag.value} value={tag.value}>
              {tag.label}
            </option>
          ))}
        </select>
      </label>

      {contexts.length > 0 && (
        <label className="block">
          <span className="mb-2 block text-sm font-bold uppercase text-ink/70">{t(locale, 'filters.context')}</span>
          <select
            value={selectedContext ?? ''}
            onChange={(event) => setFilter('context', event.target.value)}
            className="w-full border-[3px] border-black bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          >
            <option value="">{t(locale, 'filters.allContexts')}</option>
            {contexts.map((ctx) => (
              <option key={ctx} value={ctx}>
                {ctx}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        onClick={clearFilters}
        className="w-full border-[3px] border-black bg-secondary px-4 py-2 text-sm font-bold uppercase text-white shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
      >
        {t(locale, 'filters.clear')}
      </button>
    </aside>
  );
}
