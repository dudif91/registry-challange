import { Link } from 'react-router-dom'
import type { RepoSummary } from '../api/types'
import { formatCount } from '../utils/formatCount'
import { Badge } from './Badge'
import { RepoLogo } from './RepoLogo'

export function RepoCard({ repo }: { repo: RepoSummary }) {
  return (
    <li>
      <Link to={`/r/${repo.namespace}/${repo.name}`} className="card">
        <div className="card__head">
          <RepoLogo name={repo.name} src={repo.logoUrl} />
          <div className="card__title">
            <h3>{repo.displayName}</h3>
            <p className="card__owner">{repo.owner}</p>
          </div>
        </div>
        <p className="card__desc">{repo.description || 'No description provided.'}</p>
        <div className="card__meta">
          {repo.isOfficial && <Badge tone="official">Official</Badge>}
          {repo.isVerified && <Badge tone="verified">Verified publisher</Badge>}
          <span title="Stars">★ {formatCount(repo.stars)}</span>
          <span title="Pulls">⬇ {repo.pulls}</span>
        </div>
      </Link>
    </li>
  )
}
