# Release 1.1.0 — Search & Discovery

**Scope:** FEATURE-0002 (Search & Discovery), per RFC-0001 (PostgreSQL FTS) and ADR-0001 (Layered Architecture).
**Status:** Shipped.
**Date:** 2026-06-26.

## Summary

Adds free-text catalogue search to the public site. Implementation extends the
existing `Product` module top-to-bottom (Repository → Service → Server
Functions → Route → UI) without introducing any new architectural pattern or
external dependency.

Search runs entirely on the existing Supabase / PostgreSQL stack using a
generated `tsvector` column (`search_tsv`) on `public.products` indexed by GIN,
with a `pg_trgm` index on `products.name` as a fallback for very short queries.
The `'simple'` dictionary is used so fa / en / ar queries hit the same index
without language-specific stemming.

## Files changed

### New
- `src/routes/$lang.search.tsx` — search page with localized UI, RTL/LTR-aware
  layout, loading / idle / empty / no-results states, and `robots: noindex,nofollow`.
- `scripts/validate-search.ts` — 31-check invariant validator.
- `docs/releases/RELEASE-1.1.0.md` (this file).
- `docs/sessions/SESSION-2026-06-26-search-discovery.md`.
- Supabase migration adding the `search_tsv` generated column, the
  `products_search_tsv_idx` GIN index, and `products_name_trgm_idx`.

### Modified (extended, not refactored)
- `src/lib/modules/products/product.dto.ts` — added `SearchProductsQuery` and
  `SearchProductsResultDto` interfaces. No existing exports changed.
- `src/lib/modules/products/product.repository.ts` — added `search()` method
  using `.textSearch("search_tsv", …, { config: "simple" })`. Existing
  `findBySlug`, `findById`, `list` and `countsByCategory` are untouched.
- `src/lib/modules/products/product.service.ts` — added `search()` that
  delegates to the repository and reuses `mapProductSummary`.
- `src/lib/modules/products/product.functions.ts` — added `searchProducts`
  server function with Zod validation (`q: string ≤200`, optional `categoryKey`,
  `limit ≤50`, `offset ≥0`).
- `src/lib/i18n.ts` — added 8 search-related translation keys with full
  fa / en / ar coverage.

## Architectural decisions

- **No layer skipping.** The route imports only the server function, not the
  service or repository — enforced by the validator.
- **Search lives behind the repository abstraction** (per RFC-0001 / ADR-0001),
  so the storage technology can be swapped (e.g. to Meilisearch) later without
  touching higher layers or any public API.
- **`'simple'` tsvector config.** Avoids stemming conflicts between Persian,
  Arabic and English on a shared column.
- **Prefix matching + AND-joined tokens.** Multi-word queries narrow the
  result set; each token gets `:*` so partial matches (e.g. `whee` → `wheelchair`)
  still hit.
- **Trigram fallback for short queries.** Queries with no token ≥3 characters
  use `ilike` on `name`, backed by the `pg_trgm` GIN index.
- **SEO: `noindex,nofollow`.** Search result pages are not indexable per Step 6
  of the release plan; they reuse the existing `buildLocaleMeta` infrastructure
  for canonical / `hreflang` links.
- **Backward compatibility.** No existing DTO, service, server-function or
  route signature was changed. Existing callers continue to work.

## Validation results

```
$ bun run scripts/validate-search.ts
Release 1.1: 31/31 checks passed.

$ bunx tsgo --noEmit
(no errors)
```

The validator covers: DTO integrity, repository wiring, service wiring,
server-function wiring, route wiring, SEO `noindex`, localization completeness
(fa / en / ar for every search key), layered-architecture compliance (route
does not import repo, service or Supabase directly), and presence of the FTS
migration.

## Deferred work

- **Header search affordance.** A header search icon / shortcut linking to
  `/{lang}/search` was not added in this release to keep navigation untouched.
- **Pagination UI.** The server function supports `limit` / `offset`; the route
  fetches a single 48-item page. A "Load more" affordance can be added later
  without backend changes.
- **Category facet UI.** `searchProducts` already accepts `categoryKey`; the
  page does not yet expose a facet selector.
- **Per-locale ranking.** All locales share the `'simple'` tsvector. If
  ranking quality regresses in fa / ar, language-specific configs (or a
  Meilisearch backend behind the same repository contract) can be introduced
  later.
- **Analytics on zero-result queries.** Out of scope per Step 2 (Analytics
  explicitly excluded).
