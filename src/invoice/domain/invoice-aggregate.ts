import { DomainError } from '../../shared/domain/errors.js';
import type { DomainEvent, PersistedEvent } from '../../shared/domain/domain-event.js';
import { Currency, Money } from '../../shared/domain/money.js';
import {
  invoiceCreatedEvent,
  invoiceIssuedEvent,
  paymentRegisteredEvent,
  type InvoiceStatus
} from './invoice-events.js';

export class InvoiceAggregate {
  private status: InvoiceStatus = 'DRAFT';
  private amount: Money = Money.of(0, Currency.of('EUR'));
  private customerId = '';
  private businessId = '';
  private dueDate = '';
  private paidAmount: Money = Money.of(0, Currency.of('EUR'));
  private paymentIdempotencyKeys = new Set<string>();
  private version = 0;
  private readonly newEvents: DomainEvent[] = [];

  constructor(private readonly invoiceId: string) {}

  static rehydrate(invoiceId: string, history: PersistedEvent[]): InvoiceAggregate {
    const aggregate = new InvoiceAggregate(invoiceId);
    for (const event of history) {
      aggregate.apply(event);
      aggregate.version = event.version;
    }
    return aggregate;
  }

  static create(params: {
    invoiceId: string;
    businessId: string;
    customerId: string;
    amountCents: number;
    currency: string;
    dueDate: string;
  }): InvoiceAggregate {
    const aggregate = new InvoiceAggregate(params.invoiceId);
    aggregate.record(
      invoiceCreatedEvent({
        invoiceId: params.invoiceId,
        businessId: params.businessId,
        customerId: params.customerId,
        amountCents: params.amountCents,
        currency: params.currency,
        dueDate: params.dueDate
      })
    );
    return aggregate;
  }

  issue(): void {
    if (this.status !== 'DRAFT') {
      throw new DomainError('Only draft invoice can be issued');
    }
    this.record(invoiceIssuedEvent(this.invoiceId));
  }

  registerPayment(paymentId: string, amountCents: number, idempotencyKey: string): void {
    if (this.status !== 'ISSUED') {
      throw new DomainError('Payment can only be registered for issued invoice');
    }
    if (this.paymentIdempotencyKeys.has(idempotencyKey)) {
      return;
    }
    const payment = Money.of(amountCents, this.amount.currency);
    const remaining = this.amount.subtract(this.paidAmount);
    if (!remaining.isGreaterThanOrEqual(payment)) {
      throw new DomainError('Payment exceeds outstanding amount');
    }
    this.record(
      paymentRegisteredEvent({
        invoiceId: this.invoiceId,
        paymentId,
        amountCents,
        idempotencyKey
      })
    );
  }

  pullUncommittedEvents(): DomainEvent[] {
    const events = [...this.newEvents];
    this.newEvents.length = 0;
    return events;
  }

  getVersion(): number {
    return this.version;
  }

  getState(): { status: InvoiceStatus; amountCents: number; paidCents: number } {
    return {
      status: this.status,
      amountCents: this.amount.cents,
      paidCents: this.paidAmount.cents
    };
  }

  private record(event: DomainEvent): void {
    this.apply(event);
    this.newEvents.push(event);
  }

  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case 'InvoiceCreated': {
        this.status = 'DRAFT';
        this.customerId = String(event.payload.customerId);
        this.businessId = String(event.payload.businessId);
        this.dueDate = String(event.payload.dueDate);
        this.amount = Money.of(
          Number(event.payload.amountCents),
          Currency.of(String(event.payload.currency))
        );
        this.paidAmount = Money.of(0, this.amount.currency);
        break;
      }
      case 'InvoiceIssued':
        this.status = 'ISSUED';
        break;
      case 'PaymentRegistered': {
        const amount = Money.of(Number(event.payload.amountCents), this.amount.currency);
        this.paidAmount = this.paidAmount.add(amount);
        this.paymentIdempotencyKeys.add(String(event.payload.idempotencyKey));
        if (this.paidAmount.cents === this.amount.cents) {
          this.status = 'PAID';
        }
        break;
      }
      default:
        break;
    }
  }
}
