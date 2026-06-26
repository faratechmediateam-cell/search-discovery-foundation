# FARATECH PROJECT CONTEXT

## Project

Faratech Medical Engineering Platform

Medical equipment company focused on:

* Wheelchairs
* Spare Parts
* Mobility Products

Primary goals:

* Professional engineering website
* SEO-first architecture
* Lead generation
* Multilingual (Persian source)

---

# Technology Stack

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
* Server Functions
* Repository Pattern

---

# Source of Truth

Database is the runtime source of truth.

Persian content is the canonical language.

Localized fields use:

```ts
{
  fa: string;
  en?: string;
  ar?: string;
}
```

English and Arabic will be AI-generated in a future phase.

---

# Architecture

The project follows a layered architecture:

Route Loader

↓

Server Function

↓

Service

↓

Repository

↓

Database

DTOs and Mappers separate transport models from persistence models.

UI components should never access the database directly.

---

# Current Project Status

## Phase 1

✅ Product Model

✅ Category Structure

✅ Product Repository Design

Completed.

---

## Phase 2

✅ Static Product Catalog

✅ Company Data

✅ Category Copy

Completed.

---

## Phase 3

Backend Foundation

Completed.

Implemented:

* Supabase
* PostgreSQL
* Database Schema
* Migrations
* Repository Layer
* Service Layer
* DTO Layer
* Mapper Layer
* Product Module
* Category Module
* Company Module
* Server Functions

No authentication.

No dashboard.

No analytics.

---

## Phase 4

Data Wiring

Completed.

Implemented:

* Async Route Loaders
* Product pages read from Server Functions
* Category pages read from Server Functions
* Company profile read from Server Functions
* Adapter layer preserving existing UI models
* Category slug compatibility layer
* Existing URLs preserved

Static editorial copy may remain temporarily until imported into the database.

---

# Current Runtime Flow

Database

↓

Repository

↓

Service

↓

Server Function

↓

Route Loader

↓

UI

---

# Roadmap Status

🏁 The Faratech roadmap (Phases 1–10) is complete. No further phases
are scheduled. Post-launch work requires a new roadmap and explicit
approval.

Completed Phases (latest first): Phase 10 — QA, Performance and
Production Deployment, Phase 9 — Internationalization Hardening,
Phase 8 — Forms & Lead Generation, Phase 7 — Media Integration,
Phase 6 — SEO Foundation, Phase 5 — Data Import, Phase 4 — Data
Wiring, Phase 3 — Backend Modules, Phase 2 — Schema, Phase 1 —
Product Model.

---

# Phase 10 Summary

QA, Performance and Production Deployment completed:

* `src/lib/modules/leads/lead.rate-limit.ts` — sliding-window
  in-memory limiter. `LEAD_EMAIL_LIMIT` (5 / email / 10 min) and
  `LEAD_GLOBAL_LIMIT` (60 / Worker isolate / min). Pure module, no DB.
* `src/lib/modules/leads/lead.functions.ts` — added the `website`
  honeypot field to both Zod schemas, silently accepts
  honeypot-populated submissions without persisting, and enforces the
  rate-limit budgets before persisting real submissions.
* `src/lib/lead-capture.ts` plus
  `src/components/faratech/{cta,footer}.tsx` — both lead-bearing forms
  render an off-screen `aria-hidden` honeypot input named `website` and
  pass its value through to the server function.
* `docs/# 009_PRODUCTION_CHECKLIST.md` — authoritative pre-launch
  gate covering cross-locale QA, performance budgets, abuse mitigation,
  environment review, deployment, and deferred work.
* `scripts/validate-phase10.ts` — 21/21 checks pass.
* No new tables, no schema changes, no new modules — Phase 10 is
  pure hardening per the architectural rules.

---

# Phase 9 Summary

Internationalization Hardening completed:

* `src/lib/i18n.ts` gained `DEFAULT_LANG`, `localeTag`, `pickLocalized`,
  `formatNumber`, `formatDate`, `toLocalDigits`, and `htmlLangDirScript`.
* `t()` now falls back through requested → fa → en → "" so Persian
  (the canonical language) wins whenever Arabic/English is missing.
* `src/routes/$lang.tsx` head emits an inline IIFE that sets
  `<html lang/dir>` before hydration, removing RTL FOUC and ensuring
  crawlers see correct locale attributes in the initial HTML.
* `src/lib/seo.ts` no longer redeclares `pickLocalized`; the
  fa-canonical fallback rule lives in exactly one place (`i18n.ts`).
* `scripts/validate-phase9.ts` — 30/30 checks pass.

---

# Phase 8 Summary

Forms & Lead Generation completed:

* `public.leads` table with kind/status enums, length + email-format
  CHECK constraints, and RLS that allows anon/authenticated to INSERT
  only while service_role retains full access.
* Lead module under `src/lib/modules/leads/` follows the standard
  Repository → Service → Server Function pipeline.
* `scripts/validate-phase8.ts` — 18/18 checks pass.


---

# Architectural Constraints

Do NOT introduce:

* Microservices
* CQRS
* Event Bus
* Kafka
* Authentication
* Dashboard
* Search Engine
* Analytics System

Prefer simple repository-based architecture.
