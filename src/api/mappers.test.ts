import { repositoryResponse, searchResponse, tagsResponse } from '../test/fixtures'
import { mapRepository, mapSearchResponse, mapTagsResponse, splitRepoId } from './mappers'

describe('splitRepoId', () => {
  it('splits on the first slash only', () => {
    expect(splitRepoId('library/nginx')).toEqual({ namespace: 'library', name: 'nginx' })
    expect(splitRepoId('a/b/c')).toEqual({ namespace: 'a', name: 'b/c' })
  })
  it('treats a bare name as official', () => {
    expect(splitRepoId('nginx')).toEqual({ namespace: 'library', name: 'nginx' })
  })
})

describe('mapSearchResponse', () => {
  const page = mapSearchResponse(searchResponse, 0, 20)

  it('drops non-image entries', () => {
    expect(page.results.map((r) => r.id)).toEqual(['library/nginx', 'nginxinc/nginx-unprivileged'])
  })
  it('maps an official image', () => {
    expect(page.results[0]).toMatchObject({
      namespace: 'library',
      name: 'nginx',
      displayName: 'nginx',
      owner: 'Docker Official Image',
      logoUrl: 'https://cdn.example/nginx.png',
      stars: 21411,
      pulls: '1B+',
      isOfficial: true,
      isVerified: false,
    })
  })
  it('maps a verified publisher image with no logo', () => {
    expect(page.results[1]).toMatchObject({
      displayName: 'nginxinc/nginx-unprivileged',
      owner: 'NGINX Inc.',
      logoUrl: undefined,
      isOfficial: false,
      isVerified: true,
    })
  })
  it('computes hasMore from from/size/total', () => {
    expect(page.hasMore).toBe(true)
    expect(mapSearchResponse({ total: 5, results: [] }, 0, 20).hasMore).toBe(false)
  })
})

describe('mapRepository', () => {
  it('maps details', () => {
    expect(mapRepository(repositoryResponse)).toMatchObject({
      displayName: 'fluent/fluent-bit',
      owner: 'fluent',
      fullDescription: '# Fluent Bit\n\nA log processor.',
      pulls: 15904491220,
      isOfficial: false,
    })
  })
})

describe('mapTagsResponse', () => {
  const page = mapTagsResponse(tagsResponse)
  it('maps tags with sizes and de-duplicated architectures', () => {
    expect(page.total).toBe(2180)
    expect(page.hasMore).toBe(true)
    expect(page.results[0]).toEqual({
      name: 'windows-2025-5.1.4',
      lastUpdated: '2026-10-13T23:40:54.248103Z',
      sizeBytes: 2399475911,
      architectures: ['amd64'],
    })
    expect(page.results[1].architectures).toEqual(['amd64', 'arm64'])
  })
  it('reports no more pages when next is null', () => {
    expect(mapTagsResponse({ ...tagsResponse, next: null }).hasMore).toBe(false)
  })
})
