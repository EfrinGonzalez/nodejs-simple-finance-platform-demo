import type {
  InvoiceReadModel,
  InvoiceReadRepository
} from '../application/ports/invoice-read-repository.js';

export class InMemoryInvoiceReadRepository implements InvoiceReadRepository {
  private readonly models = new Map<string, InvoiceReadModel>();

  async upsert(model: InvoiceReadModel): Promise<void> {
    this.models.set(model.invoiceId, model);
  }

  async getById(invoiceId: string): Promise<InvoiceReadModel | null> {
    return this.models.get(invoiceId) ?? null;
  }

  async listOutstanding(businessId: string): Promise<InvoiceReadModel[]> {
    return [...this.models.values()].filter(
      (m) => m.businessId === businessId && m.status !== 'PAID'
    );
  }
}
