import { describe, expect, it } from 'vitest';
import { buildContainer } from '../../src/bootstrap/container.js';

describe('RegisterPayment idempotency', () => {
  it('does not double apply with same idempotency key', async () => {
    const c = buildContainer();
    await c.commands.createCustomer.execute({ customerId: 'c1', businessId: 'b1', name: 'Name', email: 'a@b.co' });
    await c.commands.createInvoice.execute({
      invoiceId: 'i1',
      businessId: 'b1',
      customerId: 'c1',
      amountCents: 500,
      currency: 'EUR',
      dueDate: '2026-05-01'
    });
    await c.commands.issueInvoice.execute({ invoiceId: 'i1' });

    await c.commands.registerPayment.execute({
      invoiceId: 'i1',
      paymentId: 'p1',
      amountCents: 500,
      idempotencyKey: 'idem-1-unique'
    });
    await c.commands.registerPayment.execute({
      invoiceId: 'i1',
      paymentId: 'p1',
      amountCents: 500,
      idempotencyKey: 'idem-1-unique'
    });

    const invoice = await c.queries.getInvoiceById.execute({ invoiceId: 'i1' });
    expect(invoice?.paidCents).toBe(500);
  });
});
