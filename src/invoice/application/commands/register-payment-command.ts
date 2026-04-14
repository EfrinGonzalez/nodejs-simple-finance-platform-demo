export interface RegisterPaymentCommand {
  invoiceId: string;
  paymentId: string;
  amountCents: number;
  idempotencyKey: string;
}
