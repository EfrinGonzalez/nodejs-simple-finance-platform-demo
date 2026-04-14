import type { Wallet } from '../../domain/wallet.js';

export interface WalletRepository {
  save(wallet: Wallet): Promise<void>;
  getById(walletId: string): Promise<Wallet | null>;
}
