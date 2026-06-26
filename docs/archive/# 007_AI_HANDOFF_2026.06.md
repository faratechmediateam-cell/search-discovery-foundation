# AI HANDOFF

## Purpose

This document is the primary entry point for any AI assistant (Lovable, Claude, ChatGPT, etc.) continuing development of the Faratech project.

Before making any changes:

1. Read this document.
2. Read `PROJECT_CONTEXT.md`.
3. Read the latest `SESSION_SUMMARY.md`.
4. Only then inspect the code relevant to the requested task.

Do not re-audit or redesign the project.

---

# Project

Faratech Medical Engineering Platform

Business:

* Medical equipment
* Wheelchairs
* Spare Parts
* Mobility Products

Goals:

* Professional engineering website
* SEO-first implementation
* Lead generation
* Multilingual support

---

# Current Phase

Current Completed Phase:

✅ Phase 10 — QA, Performance and Production Deployment

Current Active Phase:

🏁 Roadmap complete. No further phases are scheduled. Post-launch work
requires a new roadmap and explicit approval.


---

# Technology

Frontend

* React 19
* TypeScript
* TanStack Start
* TanStack Router
* TailwindCSS 4
* shadcn/ui

Backend

* Supabase
* PostgreSQL

Architecture

Route Loader

↓

Server Function

↓

Service

↓

Mapper / DTO

↓

Repository

↓

Database

---

# Current Status

Completed

* Product Model (Phase 1)
* Static Catalog & Category Structure (Phase 2)
* Backend Foundation: DB schema, migrations, Repository / DTO / Mapper / Service / Server Functions (Phase 3)
* Async Route Loaders, DB-backed product / category / company pages (Phase 4)
* Data Import (Phase 5)
* SEO Foundation: metadata, JSON-LD, hreflang (Phase 6)
* Media Integration (Phase 7)
* Forms & Lead Generation (Phase 8)
* Internationalization Hardening (Phase 9)
* QA, Performance and Production Deployment (Phase 10)

---

# Phase 10 — QA, Performance and Production Deployment (Just Completed)

Scope

* Harden the public `leads` endpoint against bot / accidental flood
  abuse without expanding the schema or adding new modules.
* Confirm SSR performance work shipped in earlier phases (LCP preload,
  pre-hydration `lang`/`dir`) is still wired.
* Produce a single, authoritative production deployment checklist.
* No new business features. No new tables. No new modules.

Changes

* `src/lib/modules/leads/lead.rate-limit.ts` (new)
  * Sliding-window in-memory limiter. Pure module — no DB, no I/O.
  * Defaults: 5 submissions per email per 10 min; 60 total per minute
    per Worker isolate.
* `src/lib/modules/leads/lead.functions.ts`
  * Added a `website` honeypot field to both contact and newsletter
    Zod schemas (must be empty).
  * If the honeypot is populated, the handler returns a success-shaped
    response without persisting and without notifying — bots cannot
    distinguish acceptance from rejection.
  * Otherwise `enforceLeadLimits(email)` runs the global + per-email
    budgets before delegating to `LeadService`.
* `src/lib/lead-capture.ts`
  * `submitContact(data, honeypot?)` and
    `submitNewsletter(data, honeypot?)` forward the honeypot value as
    `website`.
* `src/components/faratech/cta.tsx`,
  `src/components/faratech/footer.tsx`
  * Hidden honeypot `<input name="website">` rendered off-screen and
    `aria-hidden` so screen readers / autofill ignore it. Value passed
    through to the server function.
* `docs/# 009_PRODUCTION_CHECKLIST.md` (new)
  * Cross-locale QA list, performance budgets, abuse-mitigation
    summary, environment review, deployment + smoke-test gate, and the
    deferred-work register.
* `scripts/validate-phase10.ts` — 21/21 checks pass.

Invariants enforced by the validator

* Rate limiter accepts up to `max` hits per key per window and denies
  the next one with a non-negative `retryAfterMs`.
* Distinct keys hold independent budgets.
* Default budgets are positive and the global cap is &ge; the per-email
  cap.
* `lead.functions.ts` imports the limiter, declares the honeypot field
  on both schemas, short-circuits both handlers when the honeypot is
  populated, and calls `enforceLeadLimits` before persisting.
* Client `submitContact` / `submitNewsletter` forward the honeypot as
  `website`.
* Both lead-bearing forms render a hidden `name="website"` honeypot
  input and pass it through.
* Home route still preloads the LCP hero image with
  `fetchpriority="high"`.
* `public/robots.txt`, `public/sitemap.xml`,
  `public/site.webmanifest`, and `docs/# 009_PRODUCTION_CHECKLIST.md`
  all exist.

---

# Source of Truth

Runtime data must come from the database.

Static files should only remain as temporary migration sources until imported.

Persian content is canonical.

Localized fields use:

```ts
{
  fa: string;
  en?: string;
  ar?: string;
}
```

Use `pickLocalized(field, lang)` from `@/lib/i18n` whenever resolving a
localized DB field. Do not redeclare the fallback rule.

---

# Next Phase

None. The roadmap (Phases 1–10) is complete. Post-launch work
(content expansion, article CMS, admin tooling, analytics, durable
KV-backed rate limiter) requires a new roadmap and explicit approval.


---

# Future Roadmap

There are no further roadmap phases after Phase 10. Post-launch work
(content expansion, article CMS, admin tooling, analytics) requires a
new roadmap and explicit approval.

---

# Architectural Rules

Keep the existing architecture.

Do NOT redesign.

Do NOT introduce:

* CQRS
* Microservices
* Event Bus
* Kafka
* Authentication
* Dashboard
* Search Engine
* Analytics Platform

Repository Pattern is sufficient.

---

# Working Rules

Before implementing any feature:

* Read only the documentation relevant to the current phase.
* Prefer extending existing code over rewriting it.
* Preserve URLs and slugs.
* Preserve existing architecture.
* Keep implementation simple.

If the requested work falls outside the current phase, stop and explain why before making changes.
