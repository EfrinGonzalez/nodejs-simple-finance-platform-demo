import type { OutboxRepository } from './outbox-message.js';
import type { ExternalBroker } from '../../infrastructure/broker/external-broker.js';

export class OutboxRelayWorker {
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly broker: ExternalBroker,
    private readonly maxAttempts = 3
  ) {}

  async runBatch(limit = 50): Promise<void> {
    const pending = await this.outboxRepository.getPending(limit);

    for (const message of pending) {
      try {
        await this.broker.publish(message.topic, message.payload);
        await this.outboxRepository.markSent(message.id);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'unknown_error';
        if (message.attempts + 1 >= this.maxAttempts) {
          await this.outboxRepository.markFailed(message.id, `max_retries_exceeded:${reason}`);
          continue;
        }
        await this.outboxRepository.markFailed(message.id, reason);
      }
    }
  }
}
