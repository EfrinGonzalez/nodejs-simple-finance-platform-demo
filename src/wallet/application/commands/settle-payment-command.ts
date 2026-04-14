export interface SettlePaymentCommand {
  walletId: string;
  transactionId: string;
  amountCents: number;
  reference: string;
}
