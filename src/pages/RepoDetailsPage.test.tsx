import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { repositoryResponse, tagsResponse } from '../test/fixtures'
import { renderWithProviders } from '../test/render'
import { server } from '../test/server'
import { RepoDetailsPage } from './RepoDetailsPage'

const REPO = '*/hub/v2/repositories/fluent/fluent-bit/'
const TAGS = '*/hub/v2/repositories/fluent/fluent-bit/tags'

const renderPage = (route = '/r/fluent/fluent-bit') => renderWithProviders(<RepoDetailsPage />, route, '/r/:namespace/:name')

function mockRepo() {
  server.use(
    http.get(REPO, () => HttpResponse.json(repositoryResponse)),
    http.get(TAGS, () => HttpResponse.json(tagsResponse)),
  )
}

describe('RepoDetailsPage', () => {
  it('shows repository header details', async () => {
    mockRepo()
    renderPage()
    expect(await screen.findByRole('heading', { name: 'fluent/fluent-bit' })).toBeInTheDocument()
    expect(screen.getByText(/lightweight logs and metrics/)).toBeInTheDocument()
    expect(screen.getByText('fluent')).toBeInTheDocument() // owner
    expect(screen.getByText('Last updated', { selector: 'dt' })).toBeInTheDocument()
    expect(screen.getByText('15.9B')).toBeInTheDocument()
    expect(screen.getByText('docker pull fluent/fluent-bit')).toBeInTheDocument()
  })

  it('lists tags with name, architectures, last updated and size', async () => {
    mockRepo()
    renderPage()
    const row = (await screen.findByRole('rowheader', { name: '5.1.4' })).closest('tr')!
    expect(within(row).getByText('arm64')).toBeInTheDocument()
    expect(within(row).getByText('28.6 MB')).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: /Copy pull command for tag 5.1.4/ })).toBeInTheDocument()
    expect(screen.getByText('2,180 tags')).toBeInTheDocument()
  })

  it('copies the exact docker pull command for a tag', async () => {
    mockRepo()
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Copy pull command for tag 5.1.4' }))
    expect(await navigator.clipboard.readText()).toBe('docker pull fluent/fluent-bit:5.1.4')
    expect(await screen.findByText('Copied ✓')).toBeInTheDocument()
  })

  it('omits the namespace in the command for official images', async () => {
    server.use(
      http.get('*/hub/v2/repositories/library/nginx/', () =>
        HttpResponse.json({ ...repositoryResponse, namespace: 'library', name: 'nginx' }),
      ),
      http.get('*/hub/v2/repositories/library/nginx/tags', () => HttpResponse.json(tagsResponse)),
    )
    const user = userEvent.setup()
    renderPage('/r/library/nginx')
    expect(await screen.findByRole('heading', { name: 'nginx' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Copy pull command for tag 5.1.4' }))
    expect(await navigator.clipboard.readText()).toBe('docker pull nginx:5.1.4')
  })

  it('shows a not-found state for an unknown repository', async () => {
    server.use(http.get('*/hub/v2/repositories/nope/nope/', () => new HttpResponse(null, { status: 404 })))
    renderPage('/r/nope/nope')
    expect(await screen.findByText('Repository not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Explore' })).toHaveAttribute('href', '/')
  })

  it('shows an error with Retry when the repository request fails', async () => {
    server.use(http.get(REPO, () => new HttpResponse(null, { status: 500 })))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Docker Hub returned 500')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('loads more tags and appends them', async () => {
    server.use(
      http.get(REPO, () => HttpResponse.json(repositoryResponse)),
      http.get(TAGS, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page')
        return page === '1'
          ? HttpResponse.json(tagsResponse)
          : HttpResponse.json({
              count: 2180,
              next: null,
              results: [{ name: 'older-tag', last_updated: '2020-01-01T00:00:00Z', full_size: 1024, images: [] }],
            })
      }),
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('rowheader', { name: '5.1.4' })
    await user.click(screen.getByRole('button', { name: 'Load more' }))
    expect(await screen.findByRole('rowheader', { name: 'older-tag' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: '5.1.4' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('sends the debounced filter and selected ordering to the API', async () => {
    const seen: URLSearchParams[] = []
    server.use(
      http.get(REPO, () => HttpResponse.json(repositoryResponse)),
      http.get(TAGS, ({ request }) => {
        seen.push(new URL(request.url).searchParams)
        return HttpResponse.json(tagsResponse)
      }),
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('rowheader', { name: '5.1.4' })

    await user.type(screen.getByLabelText('Filter tags'), '5.1')
    await user.selectOptions(screen.getByLabelText(/Sort by/), '-name')

    await waitFor(() => {
      const last = seen[seen.length - 1]
      expect(last.get('name')).toBe('5.1')
      expect(last.get('ordering')).toBe('-name')
    })
    expect(seen.filter((p) => p.get('name') === '5.1').length).toBeGreaterThan(0)
    expect(seen.some((p) => p.get('name') === '5')).toBe(false) // debounced: no per-keystroke requests
  })

  it('shows an empty state when the filter matches no tags', async () => {
    server.use(
      http.get(REPO, () => HttpResponse.json(repositoryResponse)),
      http.get(TAGS, ({ request }) =>
        new URL(request.url).searchParams.get('name')
          ? HttpResponse.json({ count: 0, next: null, results: [] })
          : HttpResponse.json(tagsResponse),
      ),
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('rowheader', { name: '5.1.4' })
    await user.type(screen.getByLabelText('Filter tags'), 'zzz')
    expect(await screen.findByText('No tags match “zzz”')).toBeInTheDocument()
  })

  it('renders the overview markdown on the Overview tab', async () => {
    mockRepo()
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('tab', { name: 'Overview' }))
    expect(screen.getByRole('heading', { name: 'Fluent Bit' })).toBeInTheDocument()
    expect(screen.getByText('A log processor.')).toBeInTheDocument()
  })
})
