import { CATEGORIES } from '../api/categories'
import { hasFilters, type RepoFilters } from '../hooks/useRepoSearch'

interface Props {
  filters: RepoFilters
  onChange: (next: RepoFilters) => void
}

export function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Filters">
      <label className="filters__check">
        <input
          type="checkbox"
          checked={filters.official}
          onChange={(e) => onChange({ ...filters, official: e.target.checked })}
        />
        Official images only
      </label>
      <label className="toolbar__sort">
        Category{' '}
        <select value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {hasFilters(filters) && (
        <button type="button" className="btn btn--link" onClick={() => onChange({ official: false, category: '' })}>
          Clear filters
        </button>
      )}
    </div>
  )
}
