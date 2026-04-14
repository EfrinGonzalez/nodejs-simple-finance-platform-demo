import type { DomainEvent } from '../../shared/domain/domain-event.js';
import { InMemoryWalletProjectionRepository } from './in-memory-wallet-projection-repository.js';

export class WalletProjectionHandler {
  constructor(private readonly repository: InMemoryWalletProjectionRepository) {}

  async onEvent(event: DomainEvent): Promise<void> {
    const walletId = String(event.payload.walletId ?? event.aggregateId);

    if (event.eventType === 'WalletOpened') {
      await this.repository.upsert({
        walletId,
        bookedBalanceCents: 0,
        reservedBalanceCents: 0,
        availableBalanceCents: 0,
        transactions: []
      });
      return;
    }

    const current = await this.repository.getById(walletId);
    if (!current) return;

    if (event.eventType === 'FundsDeposited') {
      const amount = Number(event.payload.amountCents);
      await this.repository.upsert({
        ...current,
        bookedBalanceCents: current.bookedBalanceCents + amount,
        availableBalanceCents: current.availableBalanceCents + amount,
        transactions: [
          ...current.transactions,
          { id: String(event.payload.transactionId), type: 'DEPOSIT', amountCents: amount, reference: String(event.payload.reference) }
        ]
      });
    }

    if (event.eventType === 'FundsReserved') {
      const amount = Number(event.payload.amountCents);
      await this.repository.upsert({
        ...current,
        reservedBalanceCents: current.reservedBalanceCents + amount,
        availableBalanceCents: current.availableBalanceCents - amount,
        transactions: [
          ...current.transactions,
          { id: String(event.payload.transactionId), type: 'RESERVE', amountCents: amount, reference: String(event.payload.reference) }
        ]
      });
    }

    if (event.eventType === 'PaymentSettled') {
      const amount = Number(event.payload.amountCents);
      await this.repository.upsert({
        ...current,
        bookedBalanceCents: current.bookedBalanceCents - amount,
        reservedBalanceCents: current.reservedBalanceCents - amount,
        transactions: [
          ...current.transactions,
          { id: String(event.payload.transactionId), type: 'SETTLE', amountCents: amount, reference: String(event.payload.reference) }
        ]
      });
    }
  }
}
