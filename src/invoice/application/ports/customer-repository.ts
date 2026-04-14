import type { Customer } from '../../domain/customer.js';

export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  getById(customerId: string): Promise<Customer | null>;
}
