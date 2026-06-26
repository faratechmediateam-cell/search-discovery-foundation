# Session — 2026-06-26 — Related Products (Release 1.3)

## Goal
Implement FEATURE-0004 (Related Products) under RFC-0003 without
violating ADR-0001 or modifying unrelated modules.

## Pre-flight reading
- `docs/architecture/MASTER_ARCHITECTURE.md`
- `docs/architecture/# AI_CONTEXT.md`
- `docs/architecture/# DOCUMENTATION_MAP.md`
- `docs/features/# FEATURE-0004-related-products.md`
- `docs/rfc/# RFC-0003-related-products-strategy.md`
- `docs/adr/# ADR-0001-layered-architecture.md`

## Implementation steps
1. Extended the product DTO with `RelatedProductsQuery` and
   `RelatedProductsResultDto` (reusing `ProductSummaryDto`).
2. Added `ProductRepository.findRelated` — single SQL query against
   `products`, filtered by `category_key`, excluding the current
   product, ordered by `updated_at DESC`, bounded by a 1–24 limit.
3. Added `ProductService.getRelated` as a thin delegate, mapping rows
   through `mapProductSummary`.
4. Added the `getRelatedProducts` server function with a Zod schema
   (`uuid` productId, bounded numeric limit).
5. Updated `$lang.products.$category.$product.tsx` to fetch related
   products inside the loader's existing `Promise.all` and expose
   them via `relatedItems` to the route component.
6. Created the presentation component
   `src/components/faratech/related-products.tsx`:
   - returns `null` when empty (hides the section);
   - optional `loading` state renders a skeleton grid;
   - `<section aria-labelledby>` with localized heading;
   - focus-visible link styles, lazy-loaded images, RTL/LTR safe.
7. Added `relatedProducts` and `relatedProductsLoading` i18n keys in
   fa/en/ar.
8. Authored `scripts/validate-related-products.ts` with 53 invariant
   checks covering every Definition-of-Done item.
9. Ran the new validator (53/53), the existing search validator
   (31/31), the existing design-system validator (50/50), and
   `bunx tsgo --noEmit` (clean).

## Architectural self-review
- **MASTER_ARCHITECTURE.md** — Repository → Service → Server Function
  → Route → UI preserved. Validator asserts the route does not
  import the repository or service, the UI does not call
  `createServerFn`, and neither the service nor the server fn touch
  `getServerSupabase` directly.
- **FEATURE-0004** — All functional requirements satisfied:
  responsive section, reused summary projection, localized titles,
  RTL/LTR support, loading state, empty-state hide, a11y patterns.
- **RFC-0003** — Selection rule lives in the repository only;
  service/server-fn/UI are strategy-agnostic. No SEO side effects.
- **ADR-0001** — No layer skipped, no new pattern introduced, no
  unrelated module refactored.

## Validation
- `bun run scripts/validate-related-products.ts` → 53/53 ✅
- `bun run scripts/validate-search.ts` → 31/31 ✅
- `bun run scripts/validate-design-system.ts` → 50/50 ✅
- `bunx tsgo --noEmit` → clean ✅

## Deferred
- Tag/series-aware ranking (DB column not yet populated).
- Embedding-based recommendations (RFC-0003 future work).
- Route-level prefetching of related product detail.
