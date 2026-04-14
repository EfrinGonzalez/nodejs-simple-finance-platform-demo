import type { WalletRepository } from '../application/ports/wallet-repository.js';
import type { Wallet } from '../domain/wallet.js';

export class InMemoryWalletRepository implements WalletRepository {
  private readonly wallets = new Map<string, Wallet>();

  async save(wallet: Wallet): Promise<void> {
    this.wallets.set(wallet.walletId, wallet);
  }

  async getById(walletId: string): Promise<Wallet | null> {
    return this.wallets.get(walletId) ?? null;
  }
}
