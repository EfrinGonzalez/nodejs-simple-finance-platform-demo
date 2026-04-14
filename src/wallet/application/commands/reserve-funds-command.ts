export interface ReserveFundsCommand {
  walletId: string;
  transactionId: string;
  amountCents: number;
  reference: string;
}
