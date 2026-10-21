import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { RepoGrid, RepoGridSkeleton } from '../components/RepoGrid'
import { FilterBar } from '../components/FilterBar'
import { SearchBar } from '../components/SearchBar'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { usePopularRepos } from '../hooks/usePopularRepos'
import { hasFilters, useRepoSearch, type RepoFilters } from '../hooks/useRepoSearch'

export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const filters: RepoFilters = { official: params.get('official') === '1', category: params.get('category') ?? '' }
  const filtered = hasFilters(filters)

  const [text, setText] = useState(query)
  const debounced = useDebouncedValue(text.trim())

  // URL is the source of truth for the active query; typing updates it after a pause.
  const lastWritten = useRef(query)
  const setQuery = (q: string) => {
    if (q === query) return
    lastWritten.current = q
    writeParams(q, filters)
  }
  const writeParams = (q: string, f: RepoFilters) => {
    const next: Record<string, string> = {}
    if (q) next.q = q
    if (f.official) next.official = '1'
    if (f.category) next.category = f.category
    setParams(next, { replace: true })
  }
  useEffect(() => {
    setQuery(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  // Browser Back/Forward changes the URL without typing: pull it into the input.
  useEffect(() => {
    if (query !== lastWritten.current) {
      lastWritten.current = query
      setText(query)
    }
  }, [query])

  useEffect(() => {
    document.title = query ? `“${query}” – Registry UI` : 'Registry UI'
  }, [query])

  const popular = usePopularRepos()
  const search = useRepoSearch(query, filters)

  return (
    <>
      <section className="hero">
        <h1>Explore repositories</h1>
        <SearchBar
          value={text}
          onChange={setText}
          onSubmit={() => setQuery(text.trim())}
          onClear={() => {
            setText('')
            setQuery('')
          }}
        />
        <FilterBar filters={filters} onChange={(f) => writeParams(query, f)} />
      </section>

      {query || filtered ? (
        <SearchResults query={query} filtered={filtered} search={search} />
      ) : (
        <section aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="section-title">
            Popular repositories
          </h2>
          {popular.isPending ? (
            <RepoGridSkeleton />
          ) : popular.isError ? (
            <ErrorState error={popular.error} onRetry={() => popular.refetch()} />
          ) : (
            <RepoGrid repos={popular.data.results} />
          )}
        </section>
      )}
    </>
  )
}

function SearchResults({
  query,
  filtered,
  search,
}: {
  query: string
  filtered: boolean
  search: ReturnType<typeof useRepoSearch>
}) {
  const { isFetchNextPageError, error, fetchNextPage } = search
  if (search.isPending) return <RepoGridSkeleton count={6} />
  if (search.isError) return <ErrorState error={search.error} onRetry={() => search.refetch()} />

  const repos = search.data.pages.flatMap((p) => p.results)
  if (repos.length === 0) {
    return (
      <EmptyState title={query ? `No results for “${query}”` : 'No repositories match these filters'}>
        {filtered ? 'Try removing a filter or using a different keyword.' : 'Try a different keyword or check the spelling.'}
      </EmptyState>
    )
  }

  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading" className="section-title" aria-live="polite">
        {search.data.pages[0].total.toLocaleString()} {query ? `results for “${query}”` : 'repositories'}
      </h2>
      <RepoGrid repos={repos} />
      {search.hasNextPage && (
        <div className="more">
          <button type="button" className="btn" disabled={search.isFetchingNextPage} onClick={() => search.fetchNextPage()}>
            {search.isFetchingNextPage ? 'Loading…' : 'Show more'}
          </button>
        </div>
      )}
      {isFetchNextPageError && <ErrorState error={error} onRetry={() => fetchNextPage()} />}
    </section>
  )
}
