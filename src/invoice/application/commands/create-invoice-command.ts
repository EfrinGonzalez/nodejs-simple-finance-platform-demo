export interface CreateInvoiceCommand {
  invoiceId: string;
  businessId: string;
  customerId: string;
  amountCents: number;
  currency: string;
  dueDate: string;
}
