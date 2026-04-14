import type { EventStore } from '../../../shared/application/event-store.js';
import type { EventBus } from '../../../shared/application/event-bus.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { InvoiceAggregate } from '../../domain/invoice-aggregate.js';
import type { CreateInvoiceCommand } from '../commands/create-invoice-command.js';
import type { IssueInvoiceCommand } from '../commands/issue-invoice-command.js';
import type { RegisterPaymentCommand } from '../commands/register-payment-command.js';
import type { CustomerRepository } from '../ports/customer-repository.js';
import type { CreateCustomerCommand } from '../commands/create-customer-command.js';

export class CreateCustomerHandler {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: CreateCustomerCommand): Promise<void> {
    await this.customerRepository.save({
      id: command.customerId,
      businessId: command.businessId,
      name: command.name,
      email: command.email
    });
    await this.customerRepository.save({
      id: command.customerId,
      businessId: command.businessId,
      name: command.name,
      email: command.email
    });
  }
}

export class CreateInvoiceHandler {
  constructor(
    private readonly eventStore: EventStore,
    private readonly eventBus: EventBus,
    private readonly customerRepository: CustomerRepository
  ) {}

  async execute(command: CreateInvoiceCommand): Promise<void> {
    const customer = await this.customerRepository.getById(command.customerId);
    if (!customer) throw new NotFoundError('Customer not found');

    const invoice = InvoiceAggregate.create(command);
    const events = invoice.pullUncommittedEvents();
    await this.eventStore.appendToStream(command.invoiceId, 0, events);
    await this.eventBus.publish(events);
  }
}

export class IssueInvoiceHandler {
  constructor(private readonly eventStore: EventStore, private readonly eventBus: EventBus) {}

  async execute(command: IssueInvoiceCommand): Promise<void> {
    const history = await this.eventStore.loadStream(command.invoiceId);
    if (history.length === 0) throw new NotFoundError('Invoice not found');

    const invoice = InvoiceAggregate.rehydrate(command.invoiceId, history);
    invoice.issue();
    const events = invoice.pullUncommittedEvents();
    await this.eventStore.appendToStream(command.invoiceId, invoice.getVersion(), events);
    await this.eventBus.publish(events);
  }
}

export class RegisterPaymentHandler {
  constructor(private readonly eventStore: EventStore, private readonly eventBus: EventBus) {}

  async execute(command: RegisterPaymentCommand): Promise<void> {
    const history = await this.eventStore.loadStream(command.invoiceId);
    if (history.length === 0) throw new NotFoundError('Invoice not found');

    const invoice = InvoiceAggregate.rehydrate(command.invoiceId, history);
    invoice.registerPayment(command.paymentId, command.amountCents, command.idempotencyKey);
    const events = invoice.pullUncommittedEvents();
    if (events.length === 0) return;
    await this.eventStore.appendToStream(command.invoiceId, invoice.getVersion(), events);
    await this.eventBus.publish(events);
  }
}
