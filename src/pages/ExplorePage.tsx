import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { RepoGrid, RepoGridSkeleton } from '../components/RepoGrid'
import { SearchBar } from '../components/SearchBar'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { usePopularRepos } from '../hooks/usePopularRepos'
import { useRepoSearch } from '../hooks/useRepoSearch'

export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()

  const [text, setText] = useState(query)
  const debounced = useDebouncedValue(text.trim())

  // URL is the source of truth for the active query; typing updates it after a pause.
  const setQuery = (q: string) => {
    if (q === query) return
    setParams(q ? { q } : {}, { replace: true })
  }
  useEffect(() => {
    setQuery(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  useEffect(() => {
    document.title = query ? `“${query}” – Registry UI` : 'Registry UI'
  }, [query])

  const popular = usePopularRepos()
  const search = useRepoSearch(query)

  return (
    <>
      <section className="hero">
        <h1>Explore repositories</h1>
        <SearchBar value={text} onChange={setText} onSubmit={() => setQuery(text.trim())} />
      </section>

      {query ? (
        <SearchResults query={query} search={search} />
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

function SearchResults({ query, search }: { query: string; search: ReturnType<typeof useRepoSearch> }) {
  const { isFetchNextPageError, error, fetchNextPage } = search
  if (search.isPending) return <RepoGridSkeleton count={6} />
  if (search.isError) return <ErrorState error={search.error} onRetry={() => search.refetch()} />

  const repos = search.data.pages.flatMap((p) => p.results)
  if (repos.length === 0) {
    return (
      <EmptyState title={`No results for “${query}”`}>Try a different keyword or check the spelling.</EmptyState>
    )
  }

  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading" className="section-title">
        {search.data.pages[0].total.toLocaleString()} results for “{query}”
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
