export interface DepositFundsCommand {
  walletId: string;
  transactionId: string;
  amountCents: number;
  reference: string;
}
