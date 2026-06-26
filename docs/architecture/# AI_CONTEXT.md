# AI_CONTEXT

Version: 1.0

Status: Active

Owner: Project Architecture

---

# Purpose

This document defines the mandatory onboarding process, responsibilities, operating rules, and collaboration model for every Artificial Intelligence system that participates in the development of this project.

It exists to ensure that every AI assistant—regardless of vendor, model, or session history—operates under the same architectural principles and produces consistent, maintainable work.

This document is implementation-independent and complements:

* MASTER_ARCHITECTURE.md
* PRODUCT_EVOLUTION_ROADMAP.md
* Accepted ADRs
* Active RFCs

It never replaces them.

---

# Scope

This document applies to every AI system contributing to the project, including but not limited to:

* ChatGPT
* Claude
* Lovable
* GitHub Copilot
* Cursor AI
* Future AI assistants

No AI is exempt from these rules.

---

# Fundamental Principle

Every AI must assume that:

* conversation memory is incomplete;
* previous sessions may not exist;
* undocumented assumptions are invalid.

Documentation—not memory—is the authoritative source of truth.

---

# Order of Authority

Every AI must follow the documentation hierarchy below.

1. MASTER_ARCHITECTURE.md
2. PRODUCT_EVOLUTION_ROADMAP.md
3. Accepted ADRs
4. Active RFCs
5. This document
6. Release documentation
7. Session documentation
8. Source code

If two sources conflict, the higher authority wins.

---

# Mandatory Onboarding

Before proposing, reviewing, or implementing any change, every AI must complete the following onboarding sequence.

Step 1

Read MASTER_ARCHITECTURE.md completely.

Step 2

Read PRODUCT_EVOLUTION_ROADMAP.md.

Step 3

Read all Accepted ADRs.

Step 4

Read all Active RFCs.

Step 5

Read the latest Release document.

Step 6

Read the latest Session document.

Step 7

Identify the current architectural phase.

Step 8

Verify that no accepted ADR is violated.

Only after completing these steps may implementation begin.

---

# AI Responsibilities

Every AI has one primary responsibility.

Architecture must not silently migrate between tools.

## ChatGPT

Primary responsibilities:

* Product strategy
* Architecture
* Governance
* Roadmap
* RFC drafting
* Code review
* Architectural validation
* Documentation planning

## Claude

Primary responsibilities:

* Architectural review
* Long-form document review
* Consistency analysis
* ADR review
* RFC review
* Critical architectural feedback

Claude should challenge architecture rather than implement features.

## Lovable

Primary responsibilities:

* Feature implementation
* UI implementation
* Refactoring within approved architecture
* Validator compliance
* Documentation synchronization

Lovable implements approved architecture.

It does not redefine architecture.

## GitHub Copilot

Primary responsibilities:

* Local coding assistance
* Autocomplete
* Small refactorings
* Developer productivity

Copilot must not introduce architectural decisions.

---

# Architectural Rules

No AI may:

* bypass architectural layers;
* invent undocumented contracts;
* silently redesign modules;
* ignore accepted ADRs;
* contradict MASTER_ARCHITECTURE;
* replace documented decisions with assumptions.

When uncertainty exists, implementation stops until documentation is clarified.

---

# Communication Rules

Every AI response involving implementation should explicitly state:

* what documentation was used;
* whether ADRs were consulted;
* whether architecture changes are required;
* whether RFCs are required.

This prevents undocumented architectural drift.

---

# Decision Rules

Implementation decisions may be made freely inside existing architectural contracts.

Architectural decisions require:

* RFC (when alternatives exist)
* ADR (once accepted)

No AI may skip this process.

---

# Documentation Responsibilities

Whenever work changes project behavior, documentation must be updated.

Possible updates include:

* Release notes
* Session documentation
* RFC
* ADR
* Roadmap

Documentation is part of implementation.

---

# AI Session Rules

Every new AI session should assume zero prior knowledge.

Never rely on:

* previous chats;
* remembered prompts;
* inferred architectural intent.

Always rebuild context from documentation.

---

# Quality Expectations

Every AI contribution should improve at least one of the following:

* clarity
* maintainability
* consistency
* documentation
* validation
* architecture

Speed is never the primary objective.

---

# Success Criteria

A successful AI contribution:

* respects architecture;
* improves documentation;
* preserves consistency;
* introduces no undocumented assumptions;
* remains understandable years later.

---

# Final Principle

The purpose of AI is not to generate more code.

The purpose of AI is to help the project evolve predictably while preserving architectural integrity.
