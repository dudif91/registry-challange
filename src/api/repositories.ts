import { fetchJson } from './client'
import {
  mapRepository,
  mapSearchResponse,
  mapTagsResponse,
  type RawRepository,
  type RawSearchResponse,
  type RawTagsResponse,
} from './mappers'
import type { Page, RepoDetails, RepoSummary, Tag } from './types'

export const POPULAR_COUNT = 10

export interface SearchParams {
  query: string
  from?: number
  size?: number
  signal?: AbortSignal
}

/** Search repositories. An empty query returns the most-pulled repositories. */
export async function searchRepositories({
  query,
  from = 0,
  size = 20,
  signal,
}: SearchParams): Promise<Page<RepoSummary>> {
  const qs = new URLSearchParams({
    query: query.trim(),
    from: String(from),
    size: String(size),
    type: 'image',
    sort: 'pull_count',
    order: 'desc',
  })
  const raw = await fetchJson<RawSearchResponse>(`/api/search/v3/catalog/search?${qs}`, signal)
  return mapSearchResponse(raw, from, size)
}

export function getPopularRepositories(signal?: AbortSignal): Promise<Page<RepoSummary>> {
  return searchRepositories({ query: '', size: POPULAR_COUNT, signal })
}

export async function getRepository(namespace: string, name: string, signal?: AbortSignal): Promise<RepoDetails> {
  const raw = await fetchJson<RawRepository>(
    `/v2/repositories/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/`,
    signal,
  )
  return mapRepository(raw)
}

/** Docker Hub ordering keys: "last_updated" = newest first, "-last_updated" = oldest first, "-name" = A→Z, "name" = Z→A. */
export type TagOrdering = 'last_updated' | '-last_updated' | '-name' | 'name'

export interface TagsParams {
  namespace: string
  name: string
  page?: number
  pageSize?: number
  ordering?: TagOrdering
  filter?: string
  signal?: AbortSignal
}

export async function getTags({
  namespace,
  name,
  page = 1,
  pageSize = 25,
  ordering = 'last_updated',
  filter,
  signal,
}: TagsParams): Promise<Page<Tag>> {
  const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize), ordering })
  if (filter?.trim()) qs.set('name', filter.trim())
  const raw = await fetchJson<RawTagsResponse>(
    `/v2/repositories/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/tags?${qs}`,
    signal,
  )
  return mapTagsResponse(raw)
}
