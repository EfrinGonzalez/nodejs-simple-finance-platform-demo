import type { DomainEvent, PersistedEvent } from '../domain/domain-event.js';

export interface EventStore {
  loadStream(aggregateId: string): Promise<PersistedEvent[]>;
  appendToStream(
    aggregateId: string,
    expectedVersion: number,
    events: DomainEvent[]
  ): Promise<PersistedEvent[]>;
  getAllEvents(): Promise<PersistedEvent[]>;
}
