import type { RepoSummary } from '../api/types'
import { RepoCard } from './RepoCard'

export function RepoGrid({ repos }: { repos: RepoSummary[] }) {
  return (
    <ul className="grid">
      {repos.map((r) => (
        <RepoCard key={r.id} repo={r} />
      ))}
    </ul>
  )
}

export function RepoGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ul className="grid" aria-busy="true" aria-label="Loading repositories">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="card card--skeleton">
          <div className="skeleton skeleton--logo" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </li>
      ))}
    </ul>
  )
}
