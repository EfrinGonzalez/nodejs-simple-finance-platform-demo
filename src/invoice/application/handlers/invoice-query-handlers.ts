import type { GetInvoiceByIdQuery } from '../queries/get-invoice-by-id-query.js';
import type { ListOutstandingInvoicesQuery } from '../queries/list-outstanding-invoices-query.js';
import type { InvoiceReadRepository } from '../ports/invoice-read-repository.js';

export class GetInvoiceByIdHandler {
  constructor(private readonly readRepository: InvoiceReadRepository) {}

  execute(query: GetInvoiceByIdQuery) {
    return this.readRepository.getById(query.invoiceId);
  }
}

export class ListOutstandingInvoicesHandler {
  constructor(private readonly readRepository: InvoiceReadRepository) {}

  execute(query: ListOutstandingInvoicesQuery) {
    return this.readRepository.listOutstanding(query.businessId);
  }
}
