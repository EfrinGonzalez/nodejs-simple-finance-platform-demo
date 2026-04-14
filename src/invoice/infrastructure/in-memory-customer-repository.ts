import type { Customer } from '../domain/customer.js';
import type { CustomerRepository } from '../application/ports/customer-repository.js';

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, Customer>();

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }

  async getById(customerId: string): Promise<Customer | null> {
    return this.customers.get(customerId) ?? null;
  }
}
