import type { EventBus, EventHandler } from '../application/event-bus.js';
import type { DomainEvent } from '../domain/domain-event.js';

export class InProcessEventBus implements EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe(eventType: string, handler: EventHandler): void {
    const list = this.handlers.get(eventType) ?? [];
    list.push(handler);
    this.handlers.set(eventType, list);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const handlers = this.handlers.get(event.eventType) ?? [];
      await Promise.all(handlers.map((handler) => handler(event)));
    }
  }
}
