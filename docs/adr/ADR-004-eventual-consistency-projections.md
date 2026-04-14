# ADR-004: Eventually consistent read projections

## Decision
Read models are updated asynchronously and are eventually consistent.

## Rationale
- Keeps command path focused on invariants and write consistency.
- Mirrors real fintech trade-off where dashboards tolerate slight lag.
