import type { EventStore } from '../application/event-store.js';
import { ConcurrencyError } from '../domain/errors.js';
import type { DomainEvent, PersistedEvent } from '../domain/domain-event.js';

export class InMemoryEventStore implements EventStore {
  private readonly streams = new Map<string, PersistedEvent[]>();

  async loadStream(aggregateId: string): Promise<PersistedEvent[]> {
    return [...(this.streams.get(aggregateId) ?? [])];
  }

  async appendToStream(
    aggregateId: string,
    expectedVersion: number,
    events: DomainEvent[]
  ): Promise<PersistedEvent[]> {
    const current = this.streams.get(aggregateId) ?? [];
    const currentVersion = current.length;

    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyError(
        `Concurrency conflict for ${aggregateId}: expected ${expectedVersion}, got ${currentVersion}`
      );
    }

    const persisted = events.map((event, index) => ({
      ...event,
      version: currentVersion + index + 1
    }));

    this.streams.set(aggregateId, [...current, ...persisted]);
    return persisted;
  }

  async getAllEvents(): Promise<PersistedEvent[]> {
    return [...this.streams.values()].flat();
  }
}
