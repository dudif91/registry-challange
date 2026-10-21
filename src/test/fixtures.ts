// Trimmed copies of real Docker Hub responses (captured 2026-10-21).
import type { RawRepository, RawSearchResponse, RawTagsResponse } from '../api/mappers'

export const searchResponse: RawSearchResponse = {
  total: 291964,
  results: [
    {
      id: 'library/nginx',
      type: 'image',
      publisher: { name: 'library' },
      short_description: 'Official build of Nginx.',
      source: 'store',
      star_count: 21411,
      updated_at: '2026-10-21T04:54:46.489151Z',
      logo_url: { large: 'https://cdn.example/nginx.png', small: 'https://cdn.example/nginx-s.png' },
      rate_plans: [{ repositories: [{ pull_count: '1B+' }] }],
    },
    {
      id: 'nginxinc/nginx-unprivileged',
      type: 'image',
      publisher: { name: 'NGINX Inc.' },
      short_description: 'Unprivileged NGINX Dockerfiles',
      source: 'verified_publisher',
      star_count: 193,
      updated_at: '2026-10-19T05:04:47Z',
      rate_plans: [{ repositories: [{ pull_count: '100M+' }] }],
    },
    {
      id: 'dhi/redis',
      type: 'dhi',
      publisher: { name: 'Docker' },
      rate_plans: [],
    },
  ],
}

export const repositoryResponse: RawRepository = {
  namespace: 'fluent',
  name: 'fluent-bit',
  description: 'Fluent Bit, lightweight logs and metrics collector and forwarder',
  full_description: '# Fluent Bit\n\nA log processor.',
  star_count: 129,
  pull_count: 15904491220,
  last_updated: '2026-10-13T23:40:54.473084Z',
}

export const tagsResponse: RawTagsResponse = {
  count: 2180,
  next: 'https://hub.docker.com/v2/repositories/fluent/fluent-bit/tags?page=2&page_size=2',
  results: [
    {
      name: 'windows-2025-5.1.4',
      last_updated: '2026-10-13T23:40:54.248103Z',
      full_size: 2399475911,
      images: [{ architecture: 'amd64' }],
    },
    {
      name: '5.1.4',
      last_updated: '2026-10-13T23:39:08Z',
      full_size: 30000000,
      images: [{ architecture: 'amd64' }, { architecture: 'arm64' }, { architecture: 'amd64' }, { architecture: 'unknown' }],
    },
  ],
}
