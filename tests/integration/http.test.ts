import { describe, expect, it } from 'vitest';
import { buildContainer } from '../../src/bootstrap/container.js';
import { buildApp } from '../../src/interfaces/http/app.js';

describe('HTTP API', () => {
  it('happy path and validation error', async () => {
    const app = await buildApp(buildContainer());

    const bad = await app.inject({ method: 'POST', url: '/customers', payload: { customerId: 'x' } });
    expect(bad.statusCode).toBe(400);

    const customer = await app.inject({
      method: 'POST',
      url: '/customers',
      payload: { customerId: 'c1', businessId: 'b1', name: 'ACME', email: 'acme@test.com' }
    });
    expect(customer.statusCode).toBe(201);

    const invoice = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: {
        invoiceId: 'inv-10',
        businessId: 'b1',
        customerId: 'c1',
        amountCents: 100,
        currency: 'EUR',
        dueDate: '2026-05-30'
      }
    });

    expect(invoice.statusCode).toBe(201);
    await app.close();
  });
});
