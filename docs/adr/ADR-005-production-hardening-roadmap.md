# ADR-005: Production hardening scaffolding

## Decision
Introduce production-oriented scaffolding while keeping the demo runnable in-memory.

## Included
- Postgres event store skeleton.
- Outbox abstractions + relay worker with retries.
- External broker adapter port + Kafka/RabbitMQ stubs.
- API key + tenant header middleware.
- Tracing/metrics interfaces and HTTP instrumentation hooks.

## Rationale
This keeps the architecture evolution path explicit without forcing infra complexity into local demo usage.
