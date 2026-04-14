import { DomainError } from '../../shared/domain/errors.js';
import { Currency, Money } from '../../shared/domain/money.js';

export type WalletTransactionType = 'DEPOSIT' | 'RESERVE' | 'SETTLE';

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amountCents: number;
  reference: string;
  occurredAt: string;
}

export class Wallet {
  private constructor(
    public readonly walletId: string,
    public readonly businessId: string,
    private booked: Money,
    private reserved: Money,
    private readonly transactions: WalletTransaction[]
  ) {}

  static open(walletId: string, businessId: string, currency: string): Wallet {
    const zero = Money.of(0, Currency.of(currency));
    return new Wallet(walletId, businessId, zero, zero, []);
  }

  deposit(transactionId: string, amountCents: number, reference: string): void {
    const amount = Money.of(amountCents, this.booked.currency);
    this.booked = this.booked.add(amount);
    this.transactions.push({
      id: transactionId,
      type: 'DEPOSIT',
      amountCents,
      reference,
      occurredAt: new Date().toISOString()
    });
  }

  reserve(transactionId: string, amountCents: number, reference: string): void {
    const amount = Money.of(amountCents, this.booked.currency);
    const available = this.booked.subtract(this.reserved);
    if (!available.isGreaterThanOrEqual(amount)) {
      throw new DomainError('Insufficient available balance');
    }
    this.reserved = this.reserved.add(amount);
    this.transactions.push({
      id: transactionId,
      type: 'RESERVE',
      amountCents,
      reference,
      occurredAt: new Date().toISOString()
    });
  }

  settleReserved(transactionId: string, amountCents: number, reference: string): void {
    const amount = Money.of(amountCents, this.booked.currency);
    if (!this.reserved.isGreaterThanOrEqual(amount)) {
      throw new DomainError('Cannot settle more than reserved');
    }
    this.booked = this.booked.subtract(amount);
    this.reserved = this.reserved.subtract(amount);
    this.transactions.push({
      id: transactionId,
      type: 'SETTLE',
      amountCents,
      reference,
      occurredAt: new Date().toISOString()
    });
  }

  getSnapshot() {
    return {
      walletId: this.walletId,
      businessId: this.businessId,
      currency: this.booked.currency.code,
      bookedBalanceCents: this.booked.cents,
      reservedBalanceCents: this.reserved.cents,
      availableBalanceCents: this.booked.subtract(this.reserved).cents,
      transactions: [...this.transactions]
    };
  }
}
