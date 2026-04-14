import { describe, expect, it } from 'vitest';
import { InvoiceAggregate } from '../../src/invoice/domain/invoice-aggregate.js';

describe('InvoiceAggregate', () => {
  it('issuing an invoice changes state through events', () => {
    const invoice = InvoiceAggregate.create({
      invoiceId: 'inv-1',
      businessId: 'biz-1',
      customerId: 'cust-1',
      amountCents: 1000,
      currency: 'EUR',
      dueDate: '2026-05-01'
    });
    invoice.pullUncommittedEvents();

    invoice.issue();

    expect(invoice.pullUncommittedEvents().map((e) => e.eventType)).toEqual(['InvoiceIssued']);
    expect(invoice.getState().status).toBe('ISSUED');
  });

  it('rehydrates correctly from event stream', () => {
    const created = InvoiceAggregate.create({
      invoiceId: 'inv-2',
      businessId: 'biz-1',
      customerId: 'cust-1',
      amountCents: 1000,
      currency: 'EUR',
      dueDate: '2026-05-01'
    });
    const first = created.pullUncommittedEvents();
    created.issue();
    const second = created.pullUncommittedEvents();

    const history = [...first, ...second].map((e, idx) => ({ ...e, version: idx + 1 }));
    const rehydrated = InvoiceAggregate.rehydrate('inv-2', history);

    expect(rehydrated.getState().status).toBe('ISSUED');
  });
});
