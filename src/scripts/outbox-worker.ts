import { InMemoryOutboxRepository } from '../shared/infrastructure/outbox/in-memory-outbox-repository.js';
import { KafkaBrokerAdapter } from '../shared/infrastructure/broker/kafka-broker-adapter.js';
import { OutboxRelayWorker } from '../shared/application/outbox/outbox-relay-worker.js';

const outbox = new InMemoryOutboxRepository();
const broker = new KafkaBrokerAdapter();
const worker = new OutboxRelayWorker(outbox, broker);

const run = async () => {
  await worker.runBatch();
  console.log('Outbox relay batch executed');
};

run();
