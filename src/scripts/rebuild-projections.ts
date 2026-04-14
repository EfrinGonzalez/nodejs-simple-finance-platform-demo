import { buildContainer } from '../bootstrap/container.js';
import { InvoiceProjectionHandler } from '../invoice/readmodel/invoice-projection-handler.js';

const run = async () => {
  const c = buildContainer();
  const events = await c.eventStore.getAllEvents();
  const projector = new InvoiceProjectionHandler(c.repositories.invoiceReadRepo);

  for (const event of events) {
    await projector.onEvent(event);
  }

  console.log(`Rebuilt projections from ${events.length} events`);
};

run();
