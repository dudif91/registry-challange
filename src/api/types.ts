export interface RepoSummary {
  id: string // "library/nginx"
  namespace: string
  name: string
  displayName: string // "nginx" for official images, "namespace/name" otherwise
  description: string
  owner: string
  logoUrl?: string
  stars: number
  pulls: string // human label from the API, e.g. "1B+"
  isOfficial: boolean
  isVerified: boolean
  updatedAt: string
}

export interface RepoDetails {
  namespace: string
  name: string
  displayName: string
  description: string
  fullDescription: string // markdown
  owner: string
  stars: number
  pulls: number
  isOfficial: boolean
  lastUpdated: string
}

export interface Tag {
  name: string
  lastUpdated: string
  sizeBytes: number
  architectures: string[]
}

export interface Page<T> {
  total: number
  hasMore: boolean
  results: T[]
}
