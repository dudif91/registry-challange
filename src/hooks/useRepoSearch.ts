import { useInfiniteQuery } from '@tanstack/react-query'
import { searchRepositories } from '../api/repositories'

export const SEARCH_PAGE_SIZE = 20

/** Paged search; `from` is the offset of the next page. Disabled for an empty query. */
export function useRepoSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ['search', query],
    enabled: query.length > 0,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      searchRepositories({ query, from: pageParam, size: SEARCH_PAGE_SIZE, signal }),
    getNextPageParam: (last, _pages, lastParam) => (last.hasMore ? lastParam + SEARCH_PAGE_SIZE : undefined),
  })
}
