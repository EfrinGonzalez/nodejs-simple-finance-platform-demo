# Shine-Inspired Fintech Demo Backend (Node.js + TypeScript)

This repository contains a **staff-level demo backend** for a Shine-like product that combines **invoicing** and **wallet/ledger-like money movement** with explicit architectural decisions.

## Why this domain for Shine
Small businesses need smooth invoicing and money visibility. This demo combines:
- invoice lifecycle (customer -> draft invoice -> issue -> payment)
- wallet flow (open account, deposit, reserve, settle)
- read models for outstanding invoices and balances

This mirrors the operational burden Shine aims to remove.

## Phase 1: Architecture and Plan
- **Bounded contexts**: `invoice` (billing workflow) and `wallet` (money movement), sharing money/event primitives.
- **Aggregates**: `InvoiceAggregate` (event sourced), `Wallet` (state-based aggregate).
- **CQRS**: command handlers for writes, query handlers over projection/read repositories.
- **Event sourcing**: invoice stream in append-only event store with optimistic concurrency.
- **Async flow**: internal bus publishes domain events to projection handlers.
- **Trade-offs**: in-memory adapters for demo speed; interfaces enable PostgreSQL/Kafka evolution.

## Architecture overview
### Clean Architecture
- **Domain**: aggregates, value objects, domain events, invariants.
- **Application**: commands/queries and ports.
- **Infrastructure**: in-memory event store, repositories, event bus.
- **Interface**: Fastify API + zod validation.

Domain does not depend on infrastructure.

### DDD boundaries
- **Invoice BC** owns invoice status and payment registration rules.
- **Wallet BC** owns booked/reserved/available balance rules.
- Shared kernel has `Money`, `Currency`, event contracts.

### CQRS
- Write APIs execute command handlers.
- Query APIs read from read models/projections.

### Event Sourcing
Applied to **invoice aggregate only**:
- stream rehydration
- command execution
- append with expected version
- publish resulting events

### Async events
In-process event bus updates read projections asynchronously (replaceable with broker later).

### SOLID in code
- SRP: small focused handlers and repositories.
- OCP: infrastructure adapters replaceable via ports.
- LSP/ISP: narrow interfaces for store/bus/repos.
- DIP: application depends on abstractions, not concrete adapters.

## Architecture Diagrams
- [System Context](docs/diagrams/system-context.md)
- [Container Overview](docs/diagrams/container-overview.md)
- [Bounded Contexts](docs/diagrams/bounded-contexts.md)
- [CQRS Flow](docs/diagrams/cqrs-flow.md)
- [Event Sourcing Lifecycle](docs/diagrams/event-sourcing-lifecycle.md)
- [Invoice Payment Sequence](docs/diagrams/invoice-payment-sequence.md)
- [Wallet Flow Sequence](docs/diagrams/wallet-flow-sequence.md)

These diagrams show:
- where CQRS/event sourcing are applied
- where async projections run
- strong consistency in command path and eventual consistency in read side

## ADRs
- [ADR-001 Fastify choice](docs/adr/ADR-001-fastify-choice.md)
- [ADR-002 Selective event sourcing](docs/adr/ADR-002-selective-event-sourcing.md)
- [ADR-003 In-process bus](docs/adr/ADR-003-in-process-bus.md)
- [ADR-004 Eventually consistent projections](docs/adr/ADR-004-eventual-consistency-projections.md)

- [ADR-005 Production hardening scaffolding](docs/adr/ADR-005-production-hardening-roadmap.md)


## Run
```bash
npm install
npm run dev
```
Swagger UI: `http://localhost:3000/docs`

## Test
```bash
npm test
npm run build
```

## Example API calls
See [`example-requests.http`](example-requests.http).

## Project structure
```text
src/
  bootstrap/
  interfaces/http/
  shared/{domain,application,infrastructure}
  invoice/{domain,application,infrastructure,readmodel}
  wallet/{domain,application,infrastructure,readmodel}
  scripts/
tests/{unit,application,integration}
docs/{adr,diagrams}
```

## Fintech realism in demo
- idempotency key on payment registration
- integer cents for money precision
- immutable invoice event stream as audit trail
- optimistic concurrency in event store
- booked/reserved/available balances for wallet
- eventual consistency for projections

## Verification checklist (Phase 3)
- TypeScript compile: pending dependency install in target environment.
- Tests wired; execution pending dependency install.
- Imports clean by project structure; full verification pending dependency install.
- Architecture violations: none observed (domain independent from infra).
- Circular dependencies: avoided by one-way package boundaries.

## Future production improvements
- Postgres-backed event store/read models
- outbox pattern and retry worker
- external broker adapter (Kafka/RabbitMQ)
- authn/authz and tenant isolation
- distributed tracing and metrics


## Production-readiness scaffolding added
- `.gitignore` now excludes `dist/`, `node_modules/`, coverage and local env files to avoid noisy commits.
- Added `PostgresEventStore` scaffold (`src/shared/infrastructure/postgres/postgres-event-store.ts`) to show the next step for durable event streams/read models.
- Added outbox abstractions and worker (`OutboxRepository`, `OutboxRelayWorker`, in-memory repo, `npm run worker:outbox`) for reliable event delivery patterns.
- Added external broker adapter interface with Kafka and RabbitMQ adapter stubs for migration from in-process bus.
- Added request middleware for API key auth + tenant context headers (`x-api-key`, `x-tenant-id`) to demonstrate authn/authz + tenant isolation boundaries.
- Added telemetry interfaces and console implementations for tracing/metrics hooks on HTTP request lifecycle.

