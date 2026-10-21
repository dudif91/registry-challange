import { useInfiniteQuery } from '@tanstack/react-query'
import { getTags, type TagOrdering } from '../api/repositories'

export const TAGS_PAGE_SIZE = 25

export function useTags(namespace: string, name: string, ordering: TagOrdering, filter: string) {
  return useInfiniteQuery({
    queryKey: ['tags', namespace, name, ordering, filter],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getTags({ namespace, name, page: pageParam, pageSize: TAGS_PAGE_SIZE, ordering, filter, signal }),
    getNextPageParam: (last, _pages, lastParam) => (last.hasMore ? lastParam + 1 : undefined),
  })
}
