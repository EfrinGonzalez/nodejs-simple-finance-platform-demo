import type { ExternalBroker } from './external-broker.js';

export class KafkaBrokerAdapter implements ExternalBroker {
  async publish(topic: string, payload: Record<string, unknown>): Promise<void> {
    // TODO: replace with real Kafka producer (kafkajs)
    console.info('[kafka:publish]', { topic, payload });
  }
}
