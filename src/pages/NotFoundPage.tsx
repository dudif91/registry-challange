import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found – Registry UI'
  }, [])

  return (
    <EmptyState title="Page not found">
      <Link to="/">Back to Explore</Link>
    </EmptyState>
  )
}
