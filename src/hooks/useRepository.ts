import { useQuery } from '@tanstack/react-query'
import { getRepository } from '../api/repositories'

export function useRepository(namespace: string, name: string) {
  return useQuery({
    queryKey: ['repository', namespace, name],
    queryFn: ({ signal }) => getRepository(namespace, name, signal),
  })
}
