# RFC-0003: Related Products Strategy

Version: 1.0

Status: Accepted

Date: 2026-06-26

Owner: Architecture

---

# Executive Summary

This RFC defines how Related Products are selected and exposed within the
existing layered architecture.

The implementation must remain repository-driven, deterministic, and
replaceable in the future without affecting higher architectural layers.

---

# Problem Statement

Users benefit from discovering similar products while viewing a product
detail page.

The recommendation mechanism must remain simple, maintainable, and fully
compatible with the current architecture.

---

# Decision

Related Products will be selected using existing structured product data.

Priority should be:

1. Same category.
2. Same product family or tags (when available).
3. Exclude the current product.
4. Limit results to a configurable maximum.

No personalization or AI ranking is introduced.

---

# Architectural Principles

The feature must preserve:

Repository
→ Service
→ Server Functions
→ Routes
→ UI

Only the Repository may determine related products.

Higher layers consume the result without implementing business logic.

---

# Selection Rules

The Repository should:

* exclude unpublished products;
* exclude the current product;
* return localized DTOs;
* apply deterministic ordering;
* support configurable limits.

---

# Performance

The implementation should minimize database queries.

Future optimizations may introduce caching without changing public
contracts.

---

# SEO

The Related Products section is presentation-only.

It must not modify canonical URLs, structured data, metadata, or robots
directives.

---

# Accessibility

The section must:

* support keyboard navigation;
* use semantic headings;
* remain fully compatible with RTL and LTR layouts.

---

# Future Evolution

Future releases may replace the Repository implementation with:

* recommendation engine;
* popularity ranking;
* analytics-based ranking;
* AI-assisted recommendations.

Such evolution must not change the Service, Route, DTO, or UI contracts.

---

# Validation

Implementation must verify:

* Repository wiring;
* Service wiring;
* Server Function wiring;
* Product page integration;
* Architecture preservation.

---

# Related Documents

MASTER_ARCHITECTURE.md

AI_CONTEXT.md

FEATURE-0004 — Related Products

ADR-0001 — Layered Backend Architecture

---

# Final Decision

Accepted.

Release 1.3 will implement deterministic Related Products using the
existing Product domain while preserving the established layered
architecture and enabling future replacement of the recommendation strategy
within the Repository layer only.
