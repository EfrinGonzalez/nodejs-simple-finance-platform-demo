import type { DomainEvent } from '../domain/domain-event.js';

export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void>;

export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
}
