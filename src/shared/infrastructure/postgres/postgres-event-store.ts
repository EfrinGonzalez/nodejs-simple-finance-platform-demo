import type { EventStore } from '../../application/event-store.js';
import type { DomainEvent, PersistedEvent } from '../../domain/domain-event.js';

export class PostgresEventStore implements EventStore {
  async loadStream(_aggregateId: string): Promise<PersistedEvent[]> {
    throw new Error('PostgresEventStore not wired yet. Implement via pg adapter.');
  }

  async appendToStream(
    _aggregateId: string,
    _expectedVersion: number,
    _events: DomainEvent[]
  ): Promise<PersistedEvent[]> {
    throw new Error('PostgresEventStore not wired yet. Implement with optimistic concurrency SQL.');
  }

  async getAllEvents(): Promise<PersistedEvent[]> {
    throw new Error('PostgresEventStore not wired yet.');
  }
}
