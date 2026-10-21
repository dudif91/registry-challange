import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import type { TagOrdering } from '../api/repositories'
import { Badge } from '../components/Badge'
import { CopyButton } from '../components/CopyButton'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { TagTable } from '../components/TagTable'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useRepository } from '../hooks/useRepository'
import { useTags } from '../hooks/useTags'
import { formatCount } from '../utils/formatCount'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import { pullCommand } from '../utils/pullCommand'

type Tab = 'tags' | 'overview'

const RepoOverview = lazy(() => import('../components/RepoOverview'))

export function RepoDetailsPage() {
  const { namespace = '', name = '' } = useParams()
  const repo = useRepository(namespace, name)
  const [tab, setTab] = useState<Tab>('tags')

  useEffect(() => {
    document.title = `${repo.data?.displayName ?? `${namespace}/${name}`} – Registry UI`
  }, [repo.data, namespace, name])

  if (repo.isPending) return <DetailsSkeleton />

  if (repo.isError) {
    if (repo.error instanceof ApiError && repo.error.kind === 'not_found') {
      return (
        <EmptyState title="Repository not found">
          <code>
            {namespace}/{name}
          </code>{' '}
          doesn’t exist or is private. <Link to="/">Back to Explore</Link>
        </EmptyState>
      )
    }
    return <ErrorState error={repo.error} onRetry={() => repo.refetch()} />
  }

  const r = repo.data
  return (
    <article className="details">
      <Link to="/" className="back">
        ← Back to Explore
      </Link>

      <header className="details__head">
        <div className="details__title">
          <h1>{r.displayName}</h1>
          {r.isOfficial && <Badge tone="official">Official</Badge>}
        </div>
        <p className="details__desc">{r.description || 'No description provided.'}</p>
        <dl className="facts">
          <div>
            <dt>Owner</dt>
            <dd>{r.owner}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd title={new Date(r.lastUpdated).toLocaleString()}>{formatRelativeTime(r.lastUpdated) || '—'}</dd>
          </div>
          <div>
            <dt>Stars</dt>
            <dd>{formatCount(r.stars)}</dd>
          </div>
          <div>
            <dt>Pulls</dt>
            <dd>{formatCount(r.pulls)}</dd>
          </div>
        </dl>
        <div className="pullbox">
          <code>{pullCommand(r.namespace, r.name)}</code>
          <CopyButton text={pullCommand(r.namespace, r.name)} label="Copy" ariaLabel="Copy docker pull command" />
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Repository sections">
        {(['tags', 'overview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            className={`tabs__tab${tab === t ? ' tabs__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'tags' ? 'Tags' : 'Overview'}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'tags' ? (
          <TagsSection namespace={r.namespace} name={r.name} />
        ) : r.fullDescription ? (
          <Suspense fallback={<div className="skeleton skeleton--table" aria-busy="true" aria-label="Loading overview" />}>
            <RepoOverview markdown={r.fullDescription} />
          </Suspense>
        ) : (
          <EmptyState title="No overview available" />
        )}
      </div>
    </article>
  )
}

const SORTS: { value: TagOrdering; label: string }[] = [
  { value: 'last_updated', label: 'Newest' },
  { value: '-last_updated', label: 'Oldest' },
  { value: '-name', label: 'Name (A–Z)' },
  { value: 'name', label: 'Name (Z–A)' },
]

function TagsSection({ namespace, name }: { namespace: string; name: string }) {
  const [filterText, setFilterText] = useState('')
  const [ordering, setOrdering] = useState<TagOrdering>('last_updated')
  const filter = useDebouncedValue(filterText.trim())
  const tags = useTags(namespace, name, ordering, filter)

  const items = tags.data?.pages.flatMap((p) => p.results) ?? []

  return (
    <section aria-label="Tags">
      <div className="toolbar">
        <input
          type="search"
          className="toolbar__input"
          placeholder="Filter tags…"
          aria-label="Filter tags"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <label className="toolbar__sort">
          Sort by{' '}
          <select value={ordering} onChange={(e) => setOrdering(e.target.value as TagOrdering)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {tags.data && <span className="toolbar__count">{tags.data.pages[0].total.toLocaleString()} tags</span>}
      </div>

      {tags.isPending ? (
        <div className="skeleton skeleton--table" aria-busy="true" aria-label="Loading tags" />
      ) : tags.isError && items.length === 0 ? (
        <ErrorState error={tags.error} onRetry={() => tags.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title={filter ? `No tags match “${filter}”` : 'No tags yet'} />
      ) : (
        <>
          <TagTable namespace={namespace} name={name} tags={items} />
          {tags.isFetchNextPageError && <ErrorState error={tags.error} onRetry={() => tags.fetchNextPage()} />}
          {tags.hasNextPage && (
            <div className="more">
              <button type="button" className="btn" disabled={tags.isFetchingNextPage} onClick={() => tags.fetchNextPage()}>
                {tags.isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function DetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading repository" className="details">
      <div className="skeleton skeleton--line" style={{ width: '40%', height: 32 }} />
      <div className="skeleton skeleton--line" style={{ width: '70%' }} />
      <div className="skeleton skeleton--table" />
    </div>
  )
}
