import { http, HttpResponse } from 'msw'
import { repositoryResponse, searchResponse, tagsResponse } from '../test/fixtures'
import { server } from '../test/server'
import { ApiError } from './client'
import { getPopularRepositories, getRepository, getTags, searchRepositories } from './repositories'

describe('searchRepositories', () => {
  it('sends the expected query and maps results', async () => {
    let url: URL | undefined
    server.use(
      http.get('*/hub/api/search/v3/catalog/search', ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(searchResponse)
      }),
    )
    const page = await searchRepositories({ query: ' nginx ', from: 20, size: 10 })
    expect(Object.fromEntries(url!.searchParams)).toEqual({
      query: 'nginx',
      from: '20',
      size: '10',
      type: 'image',
      sort: 'pull_count',
      order: 'desc',
    })
    expect(page.results).toHaveLength(2)
  })

  it('getPopularRepositories uses an empty query and size 10', async () => {
    let url: URL | undefined
    server.use(
      http.get('*/hub/api/search/v3/catalog/search', ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(searchResponse)
      }),
    )
    await getPopularRepositories()
    expect(url!.searchParams.get('query')).toBe('')
    expect(url!.searchParams.get('size')).toBe('10')
  })
})

describe('getRepository', () => {
  it('maps the repository', async () => {
    server.use(http.get('*/hub/v2/repositories/fluent/fluent-bit/', () => HttpResponse.json(repositoryResponse)))
    expect((await getRepository('fluent', 'fluent-bit')).displayName).toBe('fluent/fluent-bit')
  })
})

describe('getTags', () => {
  it('passes paging, ordering and name filter', async () => {
    let url: URL | undefined
    server.use(
      http.get('*/hub/v2/repositories/fluent/fluent-bit/tags', ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(tagsResponse)
      }),
    )
    const page = await getTags({ namespace: 'fluent', name: 'fluent-bit', page: 2, ordering: 'name', filter: '5.1' })
    expect(Object.fromEntries(url!.searchParams)).toEqual({ page: '2', page_size: '25', ordering: 'name', name: '5.1' })
    expect(page.results).toHaveLength(2)
  })
})

describe('ApiError', () => {
  const path = '*/hub/v2/repositories/nope/nope/'

  it('maps 404 to not_found', async () => {
    server.use(http.get(path, () => new HttpResponse(null, { status: 404 })))
    await expect(getRepository('nope', 'nope')).rejects.toMatchObject({ kind: 'not_found', status: 404 })
  })
  it('maps 429 to rate_limited', async () => {
    server.use(http.get(path, () => new HttpResponse(null, { status: 429 })))
    await expect(getRepository('nope', 'nope')).rejects.toMatchObject({ kind: 'rate_limited', status: 429 })
  })
  it('maps other statuses to http', async () => {
    server.use(http.get(path, () => new HttpResponse(null, { status: 500 })))
    await expect(getRepository('nope', 'nope')).rejects.toMatchObject({ kind: 'http', status: 500 })
  })
  it('maps a dropped connection to network', async () => {
    server.use(http.get(path, () => HttpResponse.error()))
    const err = await getRepository('nope', 'nope').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.kind).toBe('network')
  })
})
