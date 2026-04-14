export interface InvoiceReadModel {
  invoiceId: string;
  businessId: string;
  customerId: string;
  amountCents: number;
  paidCents: number;
  currency: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID';
  dueDate: string;
}

export interface InvoiceReadRepository {
  upsert(model: InvoiceReadModel): Promise<void>;
  getById(invoiceId: string): Promise<InvoiceReadModel | null>;
  listOutstanding(businessId: string): Promise<InvoiceReadModel[]>;
}
