import { useQuery } from '@tanstack/react-query'
import { getPopularRepositories } from '../api/repositories'

export function usePopularRepos() {
  return useQuery({
    queryKey: ['popular'],
    queryFn: ({ signal }) => getPopularRepositories(signal),
  })
}
