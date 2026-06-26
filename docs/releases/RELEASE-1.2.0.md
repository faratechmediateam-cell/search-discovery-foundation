# Release 1.2.0 — Design System & UI Foundation

**Date:** 2026-06-26
**Scope:** FEATURE-0003 / RFC-0002 only.
**Status:** Shipped.

## Summary

Establishes a lightweight, presentation-only Design System layered on top of
the existing shadcn primitives. No business logic, repositories, services or
DTOs were modified. The layered architecture (ADR-0001) is preserved.

## Files changed

### Added
- `src/components/ui/loading-spinner.tsx` — accessible spinner with shared motion tokens.
- `src/components/ui/empty-state.tsx` — reusable empty state.
- `src/components/ui/error-state.tsx` — reusable error state (`role="alert"`).
- `src/components/ui/page-container.tsx` — consistent page wrapper (`.ds-page`).
- `src/components/ui/section.tsx` — consistent vertical rhythm (`.ds-section`).
- `scripts/validate-design-system.ts` — Release 1.2 invariant validator.
- `docs/releases/RELEASE-1.2.0.md`
- `docs/sessions/SESSION-2026-06-26-design-system.md`

### Modified (additive only)
- `src/styles.css` — added shadow scale (`--shadow-xs`..`--shadow-xl`),
  motion timing tokens (`--duration-*`, `--ease-*`), and `.ds-page`,
  `.ds-section`, `.ds-focus-ring`, `.ds-spin` utilities. Existing tokens
  untouched.
- `src/components/ui/button.tsx` — added `brand` variant and `xl` size.
  Existing variants/sizes preserved (backward compatible).
- `src/lib/i18n.ts` — added shared UI-state keys (`loading`, `retry`,
  `errorTitle`, `errorBody`, `emptyTitle`, `emptyBody`) in en/fa/ar.

## Architectural compliance

- **MASTER_ARCHITECTURE:** Repository → Service → Server Function → Route → UI
  unchanged. Only the UI layer received new presentation components.
- **ADR-0001:** No layer skipped or modified. New components contain no
  imports from `lib/modules/*/repository|service|functions` and no direct
  Supabase imports (validator-enforced).
- **RFC-0002:** Design tokens centralized, components reused over rewritten,
  RTL/LTR safe (no physical-axis utilities in DS components, validator-
  enforced), motion respects `prefers-reduced-motion`.
- **FEATURE-0003:** Tokens, typography scale (pre-existing), spacing, radius,
  shadow, button variants, loading/empty/error states, page-spacing
  utilities, and accessibility primitives all delivered.

## Validation results

- `bun run scripts/validate-design-system.ts` — all checks pass.
- `bun run scripts/validate-search.ts` — still passes (Release 1.1 preserved).
- `bunx tsgo --noEmit` — clean.

## Deferred work

- Dark-mode theme palette (RFC-0002 "Future Evolution").
- Per-component Storybook / internal docs.
- Gradual migration of existing routes to `<PageContainer>` / `<Section>`.
