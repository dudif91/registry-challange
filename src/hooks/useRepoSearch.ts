import { useInfiniteQuery } from '@tanstack/react-query'
import { searchRepositories } from '../api/repositories'

export const SEARCH_PAGE_SIZE = 20

export interface RepoFilters {
  official: boolean
  category: string
}

export const NO_FILTERS: RepoFilters = { official: false, category: '' }

export function hasFilters(f: RepoFilters): boolean {
  return f.official || f.category !== ''
}

/** Paged search; `from` is the offset of the next page. Disabled when there is neither a query nor a filter. */
export function useRepoSearch(query: string, filters: RepoFilters = NO_FILTERS) {
  return useInfiniteQuery({
    queryKey: ['search', query, filters.official, filters.category],
    enabled: query.length > 0 || hasFilters(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      searchRepositories({
        query,
        from: pageParam,
        size: SEARCH_PAGE_SIZE,
        official: filters.official,
        category: filters.category || undefined,
        signal,
      }),
    getNextPageParam: (last, _pages, lastParam) => (last.hasMore ? lastParam + SEARCH_PAGE_SIZE : undefined),
  })
}
