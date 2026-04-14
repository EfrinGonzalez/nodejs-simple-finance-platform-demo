import { describe, expect, it } from 'vitest';
import { buildContainer } from '../../src/bootstrap/container.js';

describe('Projection async update', () => {
  it('updates projection after events are published', async () => {
    const c = buildContainer();
    await c.commands.createCustomer.execute({ customerId: 'c2', businessId: 'b2', name: 'Name', email: 'n@b.co' });
    await c.commands.createInvoice.execute({
      invoiceId: 'i2',
      businessId: 'b2',
      customerId: 'c2',
      amountCents: 150,
      currency: 'EUR',
      dueDate: '2026-06-01'
    });
    const projection = await c.queries.getInvoiceById.execute({ invoiceId: 'i2' });
    expect(projection?.status).toBe('DRAFT');
  });
});
