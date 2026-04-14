# ADR-002: Why event sourcing only for Invoice aggregate

## Decision
Apply event sourcing to Invoice aggregate only.

## Rationale
- Invoice lifecycle benefits from full audit trail and replay.
- Wallet flow remains state-based for demo simplicity and strong consistency.
- Demonstrates that CQRS and event sourcing are independent decisions.
