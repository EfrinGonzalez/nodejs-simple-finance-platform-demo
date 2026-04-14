import { InMemoryEventStore } from '../shared/infrastructure/in-memory-event-store.js';
import { InProcessEventBus } from '../shared/infrastructure/in-process-event-bus.js';
import { InMemoryCustomerRepository } from '../invoice/infrastructure/in-memory-customer-repository.js';
import { InMemoryInvoiceReadRepository } from '../invoice/readmodel/in-memory-invoice-read-repository.js';
import { InvoiceProjectionHandler } from '../invoice/readmodel/invoice-projection-handler.js';
import {
  CreateCustomerHandler,
  CreateInvoiceHandler,
  IssueInvoiceHandler,
  RegisterPaymentHandler
} from '../invoice/application/handlers/invoice-command-handlers.js';
import {
  GetInvoiceByIdHandler,
  ListOutstandingInvoicesHandler
} from '../invoice/application/handlers/invoice-query-handlers.js';
import { InMemoryWalletRepository } from '../wallet/infrastructure/in-memory-wallet-repository.js';
import {
  DepositFundsHandler,
  OpenWalletHandler,
  ReserveFundsHandler,
  SettlePaymentHandler
} from '../wallet/application/handlers/wallet-command-handlers.js';
import {
  GetWalletBalanceHandler,
  GetWalletTransactionsHandler
} from '../wallet/application/handlers/wallet-query-handlers.js';
import { InMemoryWalletProjectionRepository } from '../wallet/readmodel/in-memory-wallet-projection-repository.js';
import { WalletProjectionHandler } from '../wallet/readmodel/wallet-projection-handler.js';
import { TenantContextStore } from '../shared/security/tenant-context.js';
import { ConsoleTelemetry } from '../shared/observability/console-telemetry.js';
import { InMemoryOutboxRepository } from '../shared/infrastructure/outbox/in-memory-outbox-repository.js';
import { KafkaBrokerAdapter } from '../shared/infrastructure/broker/kafka-broker-adapter.js';
import { OutboxRelayWorker } from '../shared/application/outbox/outbox-relay-worker.js';


export const buildContainer = () => {
  const eventStore = new InMemoryEventStore();
  const eventBus = new InProcessEventBus();
  const customerRepo = new InMemoryCustomerRepository();
  const invoiceReadRepo = new InMemoryInvoiceReadRepository();
  const walletRepo = new InMemoryWalletRepository();
  const walletProjectionRepo = new InMemoryWalletProjectionRepository();
  const tenantContextStore = new TenantContextStore();
  const telemetry = new ConsoleTelemetry();
  const outboxRepository = new InMemoryOutboxRepository();
  const externalBroker = new KafkaBrokerAdapter();
  const outboxWorker = new OutboxRelayWorker(outboxRepository, externalBroker);


  const invoiceProjection = new InvoiceProjectionHandler(invoiceReadRepo);
  const walletProjection = new WalletProjectionHandler(walletProjectionRepo);

  ['InvoiceCreated', 'InvoiceIssued', 'PaymentRegistered'].forEach((eventType) => {
    eventBus.subscribe(eventType, async (evt) => {
      await invoiceProjection.onEvent(evt);
      await outboxRepository.enqueue({
        id: evt.eventId,
        topic: evt.eventType,
        payload: evt.payload,
        attempts: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
    });

    eventBus.subscribe(eventType, (evt) => invoiceProjection.onEvent(evt));

  });

  ['WalletOpened', 'FundsDeposited', 'FundsReserved', 'PaymentSettled'].forEach((eventType) => {
    eventBus.subscribe(eventType, (evt) => walletProjection.onEvent(evt));
  });

  return {
    eventStore,
    eventBus,

    telemetry,
    tenantContextStore,
    outboxWorker,

    repositories: {
      customerRepo,
      invoiceReadRepo,
      walletRepo,

      walletProjectionRepo,
      outboxRepository

      walletProjectionRepo

    },
    commands: {
      createCustomer: new CreateCustomerHandler(customerRepo),
      createInvoice: new CreateInvoiceHandler(eventStore, eventBus, customerRepo),
      issueInvoice: new IssueInvoiceHandler(eventStore, eventBus),
      registerPayment: new RegisterPaymentHandler(eventStore, eventBus),
      openWallet: new OpenWalletHandler(walletRepo, eventBus),
      depositFunds: new DepositFundsHandler(walletRepo, eventBus),
      reserveFunds: new ReserveFundsHandler(walletRepo, eventBus),
      settlePayment: new SettlePaymentHandler(walletRepo, eventBus)
    },
    queries: {
      getInvoiceById: new GetInvoiceByIdHandler(invoiceReadRepo),
      listOutstandingInvoices: new ListOutstandingInvoicesHandler(invoiceReadRepo),
      getWalletBalance: new GetWalletBalanceHandler(walletRepo),
      getWalletTransactions: new GetWalletTransactionsHandler(walletRepo)
    }
  };
};

export type AppContainer = ReturnType<typeof buildContainer>;
