export const API_BASE = '/hub'

export type ApiErrorKind = 'not_found' | 'rate_limited' | 'http' | 'network'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

/** GET `path` (e.g. "/v2/repositories/library/nginx/") through the /hub proxy and parse JSON. */
export async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = new URL(API_BASE + path, window.location.origin).toString()

  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('network', 'Could not reach Docker Hub. Check your connection.')
  }

  if (res.status === 404) throw new ApiError('not_found', 'Not found', 404)
  if (res.status === 429) {
    throw new ApiError('rate_limited', 'Docker Hub rate limit reached. Try again shortly.', 429)
  }
  if (!res.ok) throw new ApiError('http', `Docker Hub returned ${res.status}`, res.status)

  return (await res.json()) as T
}
