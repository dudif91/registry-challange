# Docker Hub API discovery

Docker Hub has no published spec for the endpoints its own website uses, so they were found by observing the site.

## How the endpoints were found
1. Open https://hub.docker.com/search?sort=pull_count&order=desc and https://hub.docker.com/r/fluent/fluent-bit with DevTools → Network → Fetch/XHR.
2. The search page calls the **v3 catalog search** (`/api/search/v3/catalog/search`); the repository page calls the **v2 repository API** (`/v2/repositories/...`) for details and tags.
3. Each call was replayed with `curl`, parameters were varied (`query`, `size`, `from`, `sort`, `order`, `ordering`, `page_size`, `name`) and the response shapes recorded below.

## Endpoints used (base `https://hub.docker.com`)
| Purpose | Endpoint | Notes |
|---|---|---|
| Search + popular list (with logos) | `GET /api/search/v3/catalog/search?query=<q>&from=0&size=<n>&type=image&sort=pull_count&order=desc` | `{total, results[]}`. An **empty `query`** returns the most-pulled repos, so the same endpoint powers the "popular" showcase. Result: `id` (`library/nginx`), `name`, `publisher.name`, `short_description`, `star_count`, `source` (`store` = Docker Official Image, `verified_publisher`, `open_source`, `community`), `updated_at`, `logo_url.{small,large}`, `rate_plans[0].repositories[0].pull_count` (a **string**, e.g. `"1B+"`). |
| Repository details | `GET /v2/repositories/<namespace>/<name>/` | `description`, `full_description` (markdown), `namespace`/`user`, `star_count`, `pull_count` (number), `last_updated`, `is_automated`. Official images use namespace `library`. |
| Tags | `GET /v2/repositories/<ns>/<name>/tags?page_size=25&page=<n>&ordering=last_updated[&name=<filter>]` | `{count, next, results[]}`; per tag `name`, `last_updated`, `full_size` (bytes), `images[]` (`architecture`, `os`, `size`). |

Not used: `GET /v2/search/repositories/` (legacy search) – no logos, empty `repo_owner`.

## Constraints discovered
- **No CORS**: responses carry no `access-control-*` headers and `OPTIONS` returns 405, so browser code cannot call hub.docker.com. The app calls `/hub/*` and the Vite dev/preview server proxies it (`vite.config.ts`). A deployed version needs an equivalent edge/server proxy.
- **Rate limiting**: responses include `x-ratelimit-limit: 180` / `x-ratelimit-remaining`; HTTP 429 must be handled. Mitigations: debounced search, client-side caching (TanStack Query).
- **Inconsistent shapes**: `pull_count` is a string in v3 and a number in v2; the owner is `publisher.name` in v3 but `namespace` in v2; `logo_url` may be absent. All of this is normalised in `src/api/mappers.ts`.
- **Result types**: a search for `redis` with `type=image` still returned an entry with `type: "dhi"` (Docker Hardened Image). Phase 1 should check/filter this (e.g. drop results whose `type !== "image"`, or find the right filter param) because such entries don't resolve under `/v2/repositories/`.
