import type { Page, RepoDetails, RepoSummary, Tag } from './types'

// --- raw Docker Hub shapes (only the fields we read) ---

export interface RawSearchResult {
  id: string
  type: string
  publisher?: { name?: string }
  short_description?: string
  source?: string
  star_count?: number
  updated_at?: string
  logo_url?: { small?: string; large?: string }
  rate_plans?: { repositories?: { pull_count?: string }[] }[]
}

export interface RawSearchResponse {
  total: number
  results: RawSearchResult[]
}

export interface RawRepository {
  namespace: string
  name: string
  description?: string
  full_description?: string
  star_count?: number
  pull_count?: number
  last_updated?: string
}

export interface RawTag {
  name: string
  last_updated: string
  full_size?: number
  images?: { architecture?: string }[]
}

export interface RawTagsResponse {
  count: number
  next: string | null
  results: RawTag[]
}

// --- helpers ---

export const OFFICIAL_NAMESPACE = 'library'
export const OFFICIAL_OWNER_LABEL = 'Docker Official Image'

/** "library/nginx" -> { namespace: "library", name: "nginx" } (splits on the first "/"). */
export function splitRepoId(id: string): { namespace: string; name: string } {
  const i = id.indexOf('/')
  if (i === -1) return { namespace: OFFICIAL_NAMESPACE, name: id }
  return { namespace: id.slice(0, i), name: id.slice(i + 1) }
}

function displayNameOf(namespace: string, name: string): string {
  return namespace === OFFICIAL_NAMESPACE ? name : `${namespace}/${name}`
}

// --- mappers ---

export function mapSearchResult(raw: RawSearchResult): RepoSummary {
  const { namespace, name } = splitRepoId(raw.id)
  const isOfficial = namespace === OFFICIAL_NAMESPACE
  return {
    id: raw.id,
    namespace,
    name,
    displayName: displayNameOf(namespace, name),
    description: raw.short_description ?? '',
    owner: isOfficial ? OFFICIAL_OWNER_LABEL : (raw.publisher?.name ?? namespace),
    logoUrl: raw.logo_url?.large || raw.logo_url?.small || undefined,
    stars: raw.star_count ?? 0,
    pulls: raw.rate_plans?.[0]?.repositories?.[0]?.pull_count ?? '0',
    isOfficial,
    isVerified: raw.source === 'verified_publisher',
    updatedAt: raw.updated_at ?? '',
  }
}

/** Maps a v3 search response; entries that aren't plain images (e.g. "dhi") can't be opened, so drop them. */
export function mapSearchResponse(raw: RawSearchResponse, from: number, size: number): Page<RepoSummary> {
  return {
    total: raw.total,
    hasMore: from + size < raw.total,
    results: raw.results.filter((r) => r.type === 'image').map(mapSearchResult),
  }
}

export function mapRepository(raw: RawRepository): RepoDetails {
  const isOfficial = raw.namespace === OFFICIAL_NAMESPACE
  return {
    namespace: raw.namespace,
    name: raw.name,
    displayName: displayNameOf(raw.namespace, raw.name),
    description: raw.description ?? '',
    fullDescription: raw.full_description ?? '',
    owner: isOfficial ? OFFICIAL_OWNER_LABEL : raw.namespace,
    stars: raw.star_count ?? 0,
    pulls: raw.pull_count ?? 0,
    isOfficial,
    lastUpdated: raw.last_updated ?? '',
  }
}

export function mapTag(raw: RawTag): Tag {
  const archs = (raw.images ?? []).map((i) => i.architecture).filter((a): a is string => !!a && a !== 'unknown')
  return {
    name: raw.name,
    lastUpdated: raw.last_updated,
    sizeBytes: raw.full_size ?? 0,
    architectures: [...new Set(archs)],
  }
}

export function mapTagsResponse(raw: RawTagsResponse): Page<Tag> {
  return { total: raw.count, hasMore: raw.next !== null, results: raw.results.map(mapTag) }
}
