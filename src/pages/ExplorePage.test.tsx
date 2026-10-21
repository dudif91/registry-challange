import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { RawSearchResponse, RawSearchResult } from '../api/mappers'
import { server } from '../test/server'
import { renderWithProviders } from '../test/render'
import { ExplorePage } from './ExplorePage'

const SEARCH = '*/hub/api/search/v3/catalog/search'

const repo = (i: number): RawSearchResult => ({
  id: i === 0 ? 'library/nginx' : `acme/app-${i}`,
  type: 'image',
  publisher: { name: 'ACME' },
  short_description: `Description ${i}`,
  source: 'community',
  star_count: i,
  rate_plans: [{ repositories: [{ pull_count: '1M+' }] }],
})

const response = (n: number, total = n): RawSearchResponse => ({
  total,
  results: Array.from({ length: n }, (_, i) => repo(i)),
})

describe('ExplorePage', () => {
  it('shows 10 popular repositories as links to their details page', async () => {
    server.use(http.get(SEARCH, () => HttpResponse.json(response(10))))
    renderWithProviders(<ExplorePage />)

    expect(screen.getByLabelText('Loading repositories')).toBeInTheDocument()
    const links = await screen.findAllByRole('link')
    expect(links).toHaveLength(10)
    expect(links[0]).toHaveAttribute('href', '/r/library/nginx')
    expect(links[1]).toHaveAttribute('href', '/r/acme/app-1')
    expect(screen.getByText('Docker Official Image')).toBeInTheDocument()
  })

  it('sends a single debounced search request while typing', async () => {
    const queries: string[] = []
    server.use(
      http.get(SEARCH, ({ request }) => {
        queries.push(new URL(request.url).searchParams.get('query') ?? '')
        return HttpResponse.json(response(3, 3))
      }),
    )
    renderWithProviders(<ExplorePage />)
    await screen.findAllByRole('link')

    await userEvent.type(screen.getByLabelText('Search repositories'), 'redis')

    expect(await screen.findByText(/3 results for “redis”/)).toBeInTheDocument()
    expect(queries.filter((q) => q !== '')).toEqual(['redis'])
  })

  it('shows an empty state when nothing matches', async () => {
    server.use(http.get(SEARCH, () => HttpResponse.json(response(0))))
    renderWithProviders(<ExplorePage />, '/?q=zzzz')
    expect(await screen.findByText('No results for “zzzz”')).toBeInTheDocument()
  })

  it('shows an error with a working Retry', async () => {
    let calls = 0
    server.use(
      http.get(SEARCH, () => {
        calls++
        return calls === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json(response(2))
      }),
    )
    renderWithProviders(<ExplorePage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Docker Hub returned 500')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(2))
  })

  it('loads more search results', async () => {
    server.use(
      http.get(SEARCH, ({ request }) => {
        const from = Number(new URL(request.url).searchParams.get('from'))
        return HttpResponse.json(from === 0 ? response(20, 25) : { total: 25, results: response(5).results.map((r, i) => ({ ...r, id: `more/app-${i}` })) })
      }),
    )
    renderWithProviders(<ExplorePage />, '/?q=app')
    await screen.findByText(/25 results/)
    expect(screen.getAllByRole('link')).toHaveLength(20)

    await userEvent.click(screen.getByRole('button', { name: 'Show more' }))
    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(25))
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument()
  })
})
