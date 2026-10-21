import type { Tag } from '../api/types'
import { formatBytes } from '../utils/formatBytes'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import { pullCommand } from '../utils/pullCommand'
import { CopyButton } from './CopyButton'

interface Props {
  namespace: string
  name: string
  tags: Tag[]
}

export function TagTable({ namespace, name, tags }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Tag</th>
            <th scope="col">Architectures</th>
            <th scope="col">Last updated</th>
            <th scope="col">Size</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.name}>
              <th scope="row" className="table__tag">
                {tag.name}
              </th>
              <td>
                {tag.architectures.length > 0 ? (
                  <span className="chips">
                    {tag.architectures.map((a) => (
                      <span key={a} className="chip">
                        {a}
                      </span>
                    ))}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td title={new Date(tag.lastUpdated).toLocaleString()}>{formatRelativeTime(tag.lastUpdated) || '—'}</td>
              <td>{tag.sizeBytes > 0 ? formatBytes(tag.sizeBytes) : '—'}</td>
              <td className="table__action">
                <CopyButton text={pullCommand(namespace, name, tag.name)} ariaLabel={`Copy pull command for tag ${tag.name}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
