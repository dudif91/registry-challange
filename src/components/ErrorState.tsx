import { ApiError } from '../api/client'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
  return (
    <div className="state" role="alert">
      <h2>Couldn’t load data</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
