# Registry UI – Summary

A small Docker Hub-style app: an Explore page (search + 10 popular repositories) and a Repository Details page (metadata + tags with copyable pull commands). Stack: React, TypeScript, Vite, React Router, TanStack Query, Vitest + Testing Library + MSW. Run instructions are in the README.

## 1. APIs used and how I found them
Docker Hub does not publish a spec for the endpoints its own site uses, so I read them off the site: I opened `hub.docker.com/search` and `hub.docker.com/r/fluent/fluent-bit` with DevTools → Network → Fetch/XHR, then replayed each call with `curl` and varied the parameters to learn what they accept. Full notes are in [`docs/api-discovery.md`](docs/api-discovery.md).

| Purpose | Endpoint |
|---|---|
| Search, and the popular list | `GET /api/search/v3/catalog/search?query&from&size&type=image&sort=pull_count&order=desc` |
| Repository details | `GET /v2/repositories/<ns>/<name>/` |
| Tags | `GET /v2/repositories/<ns>/<name>/tags?page_size&page&ordering=last_updated[&name=]` |

Findings that shaped the design:
- **An empty `query` returns the most-pulled repositories.** One endpoint therefore serves both the search and the "10 popular" showcase, and it includes logos. The older `/v2/search/repositories/` has no logos and an empty owner, so I didn't use it.
- **No CORS headers.** The browser can't call Docker Hub directly (see decisions).
- **Rate limit of about 180 requests per window**, exposed in `x-ratelimit-*` headers.
- **Inconsistent shapes between endpoints.** See the challenges section.

## 2. Key design decisions
- **Same-origin proxy.** The app calls `/hub/*`, and Vite's dev and preview servers forward it to Docker Hub. This is the only workable option without a backend, but it means production needs an edge or server proxy.
- **Layers.** `api/` (client, endpoints, mappers) → `hooks/` (TanStack Query) → `components/` and `pages/`. Components only use the types in `api/types.ts`, never raw API shapes.
- **Mappers isolate API quirks.** All normalisation lives in `mappers.ts`: the string pull counts, the `library` namespace, the missing logos, and the filtering of non-image results.
- **TanStack Query for server state.** It gives caching (5-minute `staleTime`, which is kind to the rate limit), loading and error states, and retries that skip typed API errors such as 404 and 429.
- **URL as state.** The search query lives in `?q=` and the repository in `/r/:namespace/:name`, so every view can be shared, bookmarked and reloaded.
- **Typed `ApiError`** with kinds `not_found`, `rate_limited`, `http` and `network`. The UI shows specific messages and a Retry button.
- **Tests.** The tests cover the mappers, utilities, API client and both pages, using MSW fixtures taken from real responses. 55 tests in total.

## 3. Product decisions
**Added, and why**
| Feature | Why a user wants it |
|---|---|
| Official / Verified badges | Trust signal: the first question about an image is whether it is the real one. |
| Pull and star counts | Popularity is the main way people choose between similar images. |
| Architecture chips per tag | Multi-arch support (arm64 and others) is a top reason to look at the tag list. |
| Tag filter, sort and "Load more" | Popular repos have over 1,000 tags, so a flat list is unusable. |
| Copyable `docker pull` for the repo and for each tag, with "Copied ✓" feedback | Copying the command is the main action on this page, so it should be quick and confirmed. |
| Overview tab (rendered `full_description`, no raw HTML) | Usage instructions live in the README text. Rendering it safely keeps users on the page. |
| Explore filters: "Official images only" and a category dropdown | Browsing without a keyword ("show me official databases") is a common job. The brief says filters aren't required, so these are small additions that use the same endpoint (`official=true`, `categories=<slug>`) and live in the URL. |
| Shareable URLs, debounced search, result count, "Show more" | Search should feel fast and be linkable. Debouncing also protects the rate limit. |
| Loading skeletons, error + Retry, empty and 404 states, logo fallback | Network failures and missing data are normal, so each has a clear state. |
| Responsive layout, dark mode, focus styles, aria labels, skip link, arrow-key tabs, per-page titles | Basic accessibility and usability on phones and with keyboards. Checked with a WCAG contrast calculation (all text and accent pairs are above 4.5:1 in light and dark) and Lighthouse (100 for performance, accessibility, best practices and SEO on the Details page). |

**Deliberately left out**
- Login and private repositories: they need auth and would not use the public APIs.
- Favourites and starring: they need accounts or persistence.
- Vulnerability scanning and image layers: the data sits behind other APIs and is a separate product area.
- Sort options on Explore: results are always ordered by popularity, which is what the reference page defaults to.

## 4. Challenges and lessons
- **CORS.** Found early with `curl`, before writing any UI, which saved a rewrite. The lesson is to probe the API from a browser origin first.
- **Same concept, different shapes.** `pull_count` is a string like `"1B+"` in v3 and a number in v2. The owner is `publisher.name` in one and `namespace` in the other. Official images live under `library/`. Putting all of this in mappers kept it out of the UI.
- **Search returns entries that can't be opened.** Some results (for example `type: "dhi"`, Docker Hardened Images) don't resolve under `/v2/repositories/`, so they are filtered out.
- **Missing logos.** `logo_url` is sometimes absent or fails to load, so there is an initials fallback.
- **Rate limits** mean caching and debouncing are needed from the start.
- **Undocumented API.** These endpoints can change without notice, so mappers and typed errors act as the safety net.

## 5. What I'd improve with more time
- A small serverless or edge proxy for deployment, with a longer cache and rate-limit smoothing.
- End-to-end tests (Playwright) against recorded responses.
- Per-tag detail from `images[]`: per-architecture sizes and digests.
- Virtualised lists and infinite scroll for very large tag sets.
- Sort options on Explore, and more filters (verified publishers, architecture).
- A layers / Dockerfile view, and SSR for SEO.
