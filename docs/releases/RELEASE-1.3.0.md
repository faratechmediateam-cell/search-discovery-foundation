# Release 1.3.0 — Related Products

**Date:** 2026-06-26
**Scope:** FEATURE-0004 (Related Products) implemented under RFC-0003,
preserving ADR-0001 (Layered Architecture).

## Summary

Adds same-category related-product recommendations to the product
detail page. Selection is deterministic, server-rendered, and follows
the strict layered architecture established in
`docs/architecture/MASTER_ARCHITECTURE.md`:

```
Route loader → Server Function → Service → Repository → PostgreSQL
                                                          ↓
                                          Presentation component
```

The new feature is **purely additive**: no existing API, DTO, route
or component contract was changed.

## Files Changed

### Domain (`src/lib/modules/products/`)
- `product.dto.ts` — added `RelatedProductsQuery` and
  `RelatedProductsResultDto`. Result reuses the existing
  `ProductSummaryDto` projection (no parallel schema).
- `product.repository.ts` — added `findRelated(query)` using the
  existing `SUMMARY_SELECT`. Filters by `category_key`, excludes the
  current product (`neq id`), orders by `updated_at DESC`, caps the
  limit between 1 and 24. RFC-0003 puts this selection rule
  **only** in the repository so the strategy stays swappable.
- `product.service.ts` — added `getRelated(query)` delegating to the
  repository and mapping rows through the shared
  `mapProductSummary`.
- `product.functions.ts` — added the `getRelatedProducts` server
  function with a Zod schema (`uuid` productId, bounded limit).

### Routes / UI
- `src/routes/$lang.products.$category.$product.tsx` — fetches
  related products in the loader (parallel with the existing
  `Promise.all`) and renders the new section beneath `<ProductPage>`.
  The original `<ProductPage>` props are unchanged.
- `src/components/faratech/related-products.tsx` — **new**
  presentation-only component. Returns `null` when the list is empty
  (FEATURE-0004: "graceful handling when no related products exist"),
  supports an optional `loading` skeleton, is RTL/LTR-safe, uses an
  `aria-labelledby` section heading and focus-visible link styles.

### Localization
- `src/lib/i18n.ts` — added `relatedProducts` and
  `relatedProductsLoading` keys in `fa` / `en` / `ar`.

### Validation & Documentation
- `scripts/validate-related-products.ts` — 53 static invariant checks
  covering DTOs, repository/service/server-fn/route wiring,
  accessibility, localization, SEO, architectural layering, and
  backward compatibility.
- `docs/releases/RELEASE-1.3.0.md` — this file.
- `docs/sessions/SESSION-2026-06-26-related-products.md` — session log.

## Architectural Decisions

1. **Selection logic lives in the repository, not the service or UI.**
   RFC-0003 explicitly designates the related-products strategy as a
   storage concern so it can be swapped (e.g. for trigram similarity
   or an embedding-based recommender) without touching the higher
   layers.
2. **Same-category, recency-ordered selection.** Deterministic,
   index-friendly, and never fabricates data — when the category has
   fewer than `limit` siblings, fewer items are returned and the UI
   simply renders them; when there are zero siblings, the section is
   hidden entirely.
3. **No new SEO surface.** Per RFC-0003 §SEO, the section emits no
   structured data and does not modify the existing
   `productJsonLd` / `faqJsonLd` output. Links to related products
   are plain anchors crawlable by search engines.
4. **Reuse, not redesign.** The component reuses
   `ProductSummaryDto`, `enumToSlug`, `DirArrow`, the existing
   `Skeleton` UI primitive, and the `T`/`t` localization helpers.
   The legacy curated `product.related` rendering in `ProductPage`
   was intentionally left untouched for backward compatibility.

## Validation Results

```
$ bunx tsgo --noEmit
(clean)

$ bun run scripts/validate-related-products.ts
validate-related-products: 53/53 checks passed

$ bun run scripts/validate-search.ts
Release 1.1: 31/31 checks passed.

$ bun run scripts/validate-design-system.ts
Release 1.2: 50/50 checks passed.
```

## Deferred Work

- **Series / tag-aware ranking** (RFC-0003 §Future) — once the
  `product_tags` table is populated we can extend
  `findRelated` with a secondary `OR series=` clause or a similarity
  score. The repository contract (`{rows}`) and the service/route/UI
  layers do not need to change.
- **Embedding-based recommendations** — out of scope for Release 1.3;
  RFC-0003 keeps the interface compatible.
- **Client-side prefetching** of related product detail pages — can
  be layered on later via TanStack Router `preload`.
