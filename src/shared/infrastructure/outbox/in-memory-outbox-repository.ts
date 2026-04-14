import type { OutboxMessage, OutboxRepository } from '../../application/outbox/outbox-message.js';

export class InMemoryOutboxRepository implements OutboxRepository {
  private readonly messages = new Map<string, OutboxMessage>();

  async enqueue(message: OutboxMessage): Promise<void> {
    this.messages.set(message.id, message);
  }

  async getPending(limit: number): Promise<OutboxMessage[]> {
    return [...this.messages.values()]
      .filter((m) => m.status === 'PENDING')
      .slice(0, limit);
  }

  async markSent(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (!message) return;
    this.messages.set(id, { ...message, status: 'SENT' });
  }

  async markFailed(id: string, error: string): Promise<void> {
    const message = this.messages.get(id);
    if (!message) return;
    this.messages.set(id, {
      ...message,
      attempts: message.attempts + 1,
      status: 'FAILED',
      lastError: error
    });
  }
}
