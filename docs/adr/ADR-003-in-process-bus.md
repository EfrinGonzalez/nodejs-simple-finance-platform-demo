# ADR-003: Why in-process async bus

## Decision
Use in-process event bus abstraction for asynchronous projection updates.

## Rationale
- Keeps demo runnable without external brokers.
- Preserves a port abstraction so Kafka/RabbitMQ can replace implementation later.
