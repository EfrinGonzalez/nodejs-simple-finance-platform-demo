export interface WalletProjection {
  walletId: string;
  bookedBalanceCents: number;
  reservedBalanceCents: number;
  availableBalanceCents: number;
  transactions: Array<{ id: string; type: string; amountCents: number; reference: string }>;
}

export class InMemoryWalletProjectionRepository {
  private readonly projections = new Map<string, WalletProjection>();

  async getById(walletId: string): Promise<WalletProjection | null> {
    return this.projections.get(walletId) ?? null;
  }

  async upsert(projection: WalletProjection): Promise<void> {
    this.projections.set(projection.walletId, projection);
  }
}
