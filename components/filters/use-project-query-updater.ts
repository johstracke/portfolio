'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const PROJECT_FILTER_KEYS = ['domain', 'status', 'tag', 'context', 'search'] as const;

type ProjectFilterKey = (typeof PROJECT_FILTER_KEYS)[number];

export function useProjectQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router]
  );

  const setFilter = useCallback(
    (key: ProjectFilterKey, value: string) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const normalized = value.trim();

      if (normalized) {
        nextParams.set(key, normalized);
      } else {
        nextParams.delete(key);
      }

      pushParams(nextParams);
    },
    [pushParams, searchParams]
  );

  const clearFilters = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const key of PROJECT_FILTER_KEYS) {
      nextParams.delete(key);
    }
    pushParams(nextParams);
  }, [pushParams, searchParams]);

  return {
    setFilter,
    clearFilters,
  };
}