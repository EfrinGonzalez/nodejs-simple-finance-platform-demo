import type { DomainEvent } from '../../shared/domain/domain-event.js';
import type { InvoiceReadRepository } from '../application/ports/invoice-read-repository.js';

export class InvoiceProjectionHandler {
  constructor(private readonly repository: InvoiceReadRepository) {}

  async onEvent(event: DomainEvent): Promise<void> {
    if (event.eventType === 'InvoiceCreated') {
      await this.repository.upsert({
        invoiceId: String(event.payload.invoiceId),
        businessId: String(event.payload.businessId),
        customerId: String(event.payload.customerId),
        amountCents: Number(event.payload.amountCents),
        paidCents: 0,
        currency: String(event.payload.currency),
        status: 'DRAFT',
        dueDate: String(event.payload.dueDate)
      });
    }

    if (event.eventType === 'InvoiceIssued') {
      const current = await this.repository.getById(String(event.payload.invoiceId));
      if (!current) return;
      await this.repository.upsert({ ...current, status: 'ISSUED' });
    }

    if (event.eventType === 'PaymentRegistered') {
      const current = await this.repository.getById(String(event.payload.invoiceId));
      if (!current) return;
      const paidCents = current.paidCents + Number(event.payload.amountCents);
      await this.repository.upsert({
        ...current,
        paidCents,
        status: paidCents >= current.amountCents ? 'PAID' : current.status
      });
    }
  }
}
