# DOCUMENTATION_MAP

Version: 1.0

Status: Active

Owner: Project Architecture

---

# Purpose

This document defines the complete documentation ecosystem of the project.

Its purpose is to establish a single, authoritative map describing every documentation category, its responsibilities, ownership, update frequency, and relationship to every other document.

Every contributor—human or AI—should understand the documentation structure before contributing to the project.

This document is the canonical navigation guide for all project documentation.

---

# Documentation Philosophy

Documentation exists to preserve knowledge.

Code explains how the system behaves.

Documentation explains why the system exists, how it evolves, and how future contributors should safely extend it.

Every document should have a single responsibility.

If two documents attempt to answer the same question, the documentation structure should be reconsidered.

---

# Documentation Hierarchy

All documentation follows a strict hierarchy.

```text
MASTER_ARCHITECTURE.md
        │
        ▼
PRODUCT_EVOLUTION_ROADMAP.md
        │
        ▼
Architecture Decision Records (ADR)
        │
        ▼
Request For Comments (RFC)
        │
        ▼
Release Documentation
        │
        ▼
Session Documentation
        │
        ▼
Operational Checklists
        │
        ▼
Implementation
```

Higher levels define rules.

Lower levels apply those rules.

Lower documentation may extend—but never contradict—the levels above it.

---

# Documentation Categories

## 1. MASTER_ARCHITECTURE.md

Purpose

Defines the permanent architectural constitution of the project.

Contains:

* architectural principles;
* layer definitions;
* module contracts;
* governance rules;
* AI collaboration model;
* architectural constraints.

Update Frequency

Extremely low.

Expected lifetime:

Entire project lifecycle.

Authority

Highest.

---

## 2. PRODUCT_EVOLUTION_ROADMAP.md

Purpose

Defines how the product evolves over time.

Contains:

* strategic roadmap;
* governance;
* feature lifecycle;
* quality strategy;
* innovation strategy;
* long-term evolution.

Update Frequency

Major releases.

Authority

High.

---

## 3. AI_CONTEXT.md

Purpose

Defines how AI systems collaborate with the project.

Contains:

* onboarding;
* responsibilities;
* authority hierarchy;
* workflow;
* implementation rules.

Update Frequency

Occasional.

Authority

High.

---

## 4. ADR

Directory

docs/adr/

Purpose

Records permanent architectural decisions.

Characteristics

* immutable;
* sequential;
* historical;
* never rewritten.

Each ADR answers:

* Why?
* Why not?
* What changed?
* What consequences follow?

Update Frequency

Only when architecture changes.

---

## 5. RFC

Directory

docs/rfc/

Purpose

Evaluate proposals before decisions are made.

Characteristics

Temporary.

Discussion-oriented.

RFCs become:

* Accepted
* Rejected
* Withdrawn
* Archived

Accepted RFCs may eventually produce ADRs.

---

## 6. Release Documentation

Directory

docs/releases/

Purpose

Describe every released version.

Contains:

* summary;
* implemented features;
* bug fixes;
* ADR references;
* RFC references;
* validation results;
* deployment notes;
* deferred work.

One document per release.

---

## 7. Session Documentation

Directory

docs/sessions/

Purpose

Preserve implementation history.

Contains:

* work completed;
* architectural decisions made during implementation;
* pending tasks;
* blockers;
* validator results.

Sessions are chronological.

They are operational history—not architecture.

---

## 8. Operational Checklists

Directory

docs/checklists/

Purpose

Standardize operational procedures.

Examples

* Production
* Deployment
* Security
* QA
* SEO
* Accessibility

Checklists should be concise, repeatable, and version-controlled.

---

## 9. Templates

Directory

docs/templates/

Purpose

Provide standardized formats for all recurring documentation.

Examples

* ADR Template
* RFC Template
* Release Template
* Session Template
* Feature Proposal Template

Templates reduce inconsistency.

---

## 10. Archive

Directory

docs/archive/

Purpose

Preserve obsolete documentation.

Archive is read-only.

Archived documents remain searchable but are no longer authoritative.

Nothing is deleted without explicit justification.

---

# Documentation Lifecycle

Every significant change follows this sequence.

```text
Business Need
      │
      ▼
Roadmap
      │
      ▼
RFC (if required)
      │
      ▼
ADR (if required)
      │
      ▼
Implementation
      │
      ▼
Validation
      │
      ▼
Release
      │
      ▼
Session Documentation
```

Documentation evolves before implementation—not after it.

---

# Responsibility Matrix

| Document                  | Owner                  | Update Trigger                   |
| ------------------------- | ---------------------- | -------------------------------- |
| MASTER_ARCHITECTURE       | Architecture           | Fundamental architectural change |
| PRODUCT_EVOLUTION_ROADMAP | Product Strategy       | Strategic roadmap updates        |
| AI_CONTEXT                | Architecture           | AI workflow changes              |
| ADR                       | Architecture           | Accepted architectural decision  |
| RFC                       | Product / Architecture | Proposal requiring review        |
| Release                   | Development            | Every release                    |
| Session                   | Development            | Every development session        |
| Checklist                 | Operations             | Process improvements             |
| Templates                 | Architecture           | Documentation standard changes   |

---

# AI Reading Order

Every AI should read documentation in the following order.

1. MASTER_ARCHITECTURE.md
2. PRODUCT_EVOLUTION_ROADMAP.md
3. AI_CONTEXT.md
4. Accepted ADRs
5. Active RFCs
6. Latest Release
7. Latest Session

Only after completing this sequence should implementation begin.

---

# Naming Conventions

ADR

ADR-0001-short-title.md

RFC

RFC-0001-short-title.md

Release

RELEASE-1.0.0.md

Session

YYYY-MM-DD-short-summary.md

Checklists

UPPERCASE_NAME.md

Templates

NAME_TEMPLATE.md

Naming should remain consistent throughout the project.

---

# Governance Rules

Documentation should satisfy the following principles.

* Every document has one purpose.
* Every document has one owner.
* Every document has one canonical location.
* Every architectural decision is traceable.
* Every release is reproducible.
* Every implementation is explainable.

---

# Maintenance Policy

Documentation should be reviewed periodically.

Recommended cadence:

* MASTER_ARCHITECTURE — annually.
* PRODUCT_EVOLUTION_ROADMAP — every major release.
* AI_CONTEXT — when AI workflow changes.
* ADRs — never rewritten.
* RFCs — archived after resolution.
* Releases — immutable after publication.
* Sessions — immutable after completion.
* Checklists — reviewed quarterly.
* Templates — reviewed when documentation standards evolve.

---

# Success Criteria

The documentation system is considered healthy when:

* every architectural decision is traceable;
* every feature can be linked to planning documents;
* every release can be reproduced from documentation;
* every AI can rebuild project context without conversation history;
* documentation remains easier to navigate than the source code itself.

---

# Final Principle

Documentation is part of the architecture.

If the architecture cannot be understood from its documentation, the documentation is incomplete.

If the documentation no longer reflects reality, the architecture is no longer governed.

Both conditions must be treated as defects.

---

End of Document.
