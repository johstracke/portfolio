'use client';

import { useState } from 'react';
import { useProjectQueryUpdater } from '@/components/filters/use-project-query-updater';

type SearchBarProps = {
  initialValue?: string;
};

export function SearchBar({ initialValue = '' }: SearchBarProps) {
  const { setFilter } = useProjectQueryUpdater();
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilter('search', value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by title or summary"
        className="min-w-0 flex-1 border-[3px] border-black bg-surface px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
      />
      <button
        type="submit"
        className="border-[3px] border-black bg-primary px-5 py-3 text-sm font-bold uppercase shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
      >
        Search
      </button>
    </form>
  );
}
