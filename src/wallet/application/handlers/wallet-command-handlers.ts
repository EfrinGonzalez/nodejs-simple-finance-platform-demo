import { NotFoundError } from '../../../shared/domain/errors.js';
import { Wallet } from '../../domain/wallet.js';
import type { WalletRepository } from '../ports/wallet-repository.js';
import type { EventBus } from '../../../shared/application/event-bus.js';
import { createEventId, type DomainEvent } from '../../../shared/domain/domain-event.js';
import type { OpenWalletCommand } from '../commands/open-wallet-command.js';
import type { DepositFundsCommand } from '../commands/deposit-funds-command.js';
import type { ReserveFundsCommand } from '../commands/reserve-funds-command.js';
import type { SettlePaymentCommand } from '../commands/settle-payment-command.js';

const walletEvent = (aggregateId: string, eventType: string, payload: Record<string, unknown>): DomainEvent => ({
  eventId: createEventId(),
  aggregateId,
  eventType,
  occurredAt: new Date(),
  payload
});

export class OpenWalletHandler {
  constructor(private readonly repository: WalletRepository, private readonly eventBus: EventBus) {}

  async execute(command: OpenWalletCommand): Promise<void> {
    const wallet = Wallet.open(command.walletId, command.businessId, command.currency);
    await this.repository.save(wallet);
    await this.eventBus.publish([
      walletEvent(command.walletId, 'WalletOpened', { ...command })
    ]);
  }
}

export class DepositFundsHandler {
  constructor(private readonly repository: WalletRepository, private readonly eventBus: EventBus) {}

  async execute(command: DepositFundsCommand): Promise<void> {
    const wallet = await this.repository.getById(command.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    wallet.deposit(command.transactionId, command.amountCents, command.reference);
    await this.repository.save(wallet);
    await this.eventBus.publish([
      walletEvent(command.walletId, 'FundsDeposited', { ...command })
    ]);
  }
}

export class ReserveFundsHandler {
  constructor(private readonly repository: WalletRepository, private readonly eventBus: EventBus) {}

  async execute(command: ReserveFundsCommand): Promise<void> {
    const wallet = await this.repository.getById(command.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    wallet.reserve(command.transactionId, command.amountCents, command.reference);
    await this.repository.save(wallet);
    await this.eventBus.publish([
      walletEvent(command.walletId, 'FundsReserved', { ...command })
    ]);
  }
}

export class SettlePaymentHandler {
  constructor(private readonly repository: WalletRepository, private readonly eventBus: EventBus) {}

  async execute(command: SettlePaymentCommand): Promise<void> {
    const wallet = await this.repository.getById(command.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    wallet.settleReserved(command.transactionId, command.amountCents, command.reference);
    await this.repository.save(wallet);
    await this.eventBus.publish([
      walletEvent(command.walletId, 'PaymentSettled', { ...command })
    ]);
  }
}
