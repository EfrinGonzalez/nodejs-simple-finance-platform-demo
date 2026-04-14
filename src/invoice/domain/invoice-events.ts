import { createEventId, type DomainEvent } from '../../shared/domain/domain-event.js';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID';

export const invoiceCreatedEvent = (params: {
  invoiceId: string;
  businessId: string;
  customerId: string;
  amountCents: number;
  currency: string;
  dueDate: string;
}): DomainEvent => ({
  eventId: createEventId(),
  aggregateId: params.invoiceId,
  eventType: 'InvoiceCreated',
  occurredAt: new Date(),
  payload: params
});

export const invoiceIssuedEvent = (invoiceId: string): DomainEvent => ({
  eventId: createEventId(),
  aggregateId: invoiceId,
  eventType: 'InvoiceIssued',
  occurredAt: new Date(),
  payload: { invoiceId }
});

export const paymentRegisteredEvent = (params: {
  invoiceId: string;
  paymentId: string;
  amountCents: number;
  idempotencyKey: string;
}): DomainEvent => ({
  eventId: createEventId(),
  aggregateId: params.invoiceId,
  eventType: 'PaymentRegistered',
  occurredAt: new Date(),
  payload: params
});
