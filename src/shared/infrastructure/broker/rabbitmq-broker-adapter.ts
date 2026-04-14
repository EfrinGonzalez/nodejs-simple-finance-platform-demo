import type { ExternalBroker } from './external-broker.js';

export class RabbitMqBrokerAdapter implements ExternalBroker {
  async publish(topic: string, payload: Record<string, unknown>): Promise<void> {
    // TODO: replace with real AMQP publisher (amqplib)
    console.info('[rabbitmq:publish]', { topic, payload });
  }
}
