import { NotFoundError } from '../../../shared/domain/errors.js';
import type { WalletRepository } from '../ports/wallet-repository.js';
import type { GetWalletBalanceQuery } from '../queries/get-wallet-balance-query.js';
import type { GetWalletTransactionsQuery } from '../queries/get-wallet-transactions-query.js';

export class GetWalletBalanceHandler {
  constructor(private readonly repository: WalletRepository) {}

  async execute(query: GetWalletBalanceQuery) {
    const wallet = await this.repository.getById(query.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    return wallet.getSnapshot();
  }
}

export class GetWalletTransactionsHandler {
  constructor(private readonly repository: WalletRepository) {}

  async execute(query: GetWalletTransactionsQuery) {
    const wallet = await this.repository.getById(query.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    return wallet.getSnapshot().transactions;
  }
}
