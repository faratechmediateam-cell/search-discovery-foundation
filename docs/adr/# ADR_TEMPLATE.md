# ADR-XXXX: <Short Title>

Version: 1.0

Status: Proposed | Accepted | Superseded | Deprecated

Date: YYYY-MM-DD

Owner: <Architecture Owner>

Related RFC:
RFC-XXXX (if applicable)

Supersedes:
ADR-XXXX (if applicable)

---

# Purpose

This Architecture Decision Record documents one permanent architectural
decision affecting the structure, contracts, governance, or long-term
evolution of the project.

An ADR captures why the decision was made—not merely what changed.

Once accepted, ADRs become part of the project's architectural
constitution.

---

# Context

Describe the architectural context that required a decision.

Include:

- current system state
- architectural constraints
- business drivers
- existing limitations
- historical background

Questions to answer:

Why has this decision become necessary?

Why now?

---

# Problem Statement

State the architectural question precisely.

Examples:

Should media storage become private?

Should Repository abstraction be introduced?

Should authentication move to an external provider?

Avoid describing solutions.

Describe only the problem.

---

# Goals

Describe the desired outcomes.

Examples:

- reduce coupling
- improve scalability
- improve maintainability
- simplify deployment
- preserve backwards compatibility

---

# Non-Goals

Explicitly describe what this ADR does NOT attempt to solve.

Example:

This ADR does not redesign authentication.

---

# Constraints

List all known constraints.

Examples:

- budget
- runtime
- framework
- backwards compatibility
- legal requirements
- infrastructure
- existing contracts

---

# Considered Alternatives

Every serious architectural alternative should be documented.

For each alternative include:

## Alternative A

Description

Advantages

Disadvantages

Reason rejected

---

## Alternative B

...

---

# Decision

Describe the accepted solution.

Write clearly.

Avoid implementation details.

State architectural intent.

---

# Architectural Impact

Describe which architectural layers change.

Possible areas:

Repository

Service

DTO

Mapper

Routes

Database

Infrastructure

Deployment

Documentation

---

# Trade-offs

Every architectural decision sacrifices something.

List those sacrifices explicitly.

Examples:

Higher complexity

Lower flexibility

Extra infrastructure

Performance cost

Learning curve

---

# Consequences

Describe long-term consequences.

Positive

Negative

Neutral

Future implications

---

# Compatibility

Breaking Change?

Yes / No

Migration Required?

Yes / No

Rollback Possible?

Yes / No

---

# Validation Strategy

How will this decision be verified?

Possible examples:

Validator

Tests

Load testing

Security review

Architecture review

---

# Risks

Describe technical risks.

Operational risks.

Business risks.

Maintenance risks.

---

# Future Considerations

List expected future evolution.

Do not speculate unnecessarily.

---

# Documentation Updates

Documents requiring updates.

MASTER_ARCHITECTURE

ROADMAP

AI_CONTEXT

RFC

Release Notes

Session Summary

Other

---

# References

Related ADRs

Related RFCs

External specifications

Official documentation

---

# Approval

Architecture Owner

Approved

Date

---

# Revision History

Initial creation

Status changes

Superseded by

Deprecated

Never rewrite history.
Append new entries only.