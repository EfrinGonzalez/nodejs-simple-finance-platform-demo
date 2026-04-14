import { buildContainer } from '../bootstrap/container.js';

const run = async () => {
  const c = buildContainer();

  await c.commands.createCustomer.execute({
    customerId: 'cust-1',
    businessId: 'biz-1',
    name: 'Acme GmbH',
    email: 'finance@acme.test'
  });

  await c.commands.createInvoice.execute({
    invoiceId: 'inv-1',
    businessId: 'biz-1',
    customerId: 'cust-1',
    amountCents: 25000,
    currency: 'EUR',
    dueDate: '2026-05-01'
  });

  await c.commands.issueInvoice.execute({ invoiceId: 'inv-1' });
  await c.commands.registerPayment.execute({
    invoiceId: 'inv-1',
    paymentId: 'pay-1',
    amountCents: 25000,
    idempotencyKey: 'idem-key-1'
  });

  console.log(await c.queries.getInvoiceById.execute({ invoiceId: 'inv-1' }));
};

run();
