import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { DomainError, NotFoundError } from '../../shared/domain/errors.js';
import type { AppContainer } from '../../bootstrap/container.js';

import { authAndTenantMiddleware } from './middleware/auth.js';


const customerSchema = z.object({
  customerId: z.string(),
  businessId: z.string(),
  name: z.string().min(2),
  email: z.string().email()
});

const createInvoiceSchema = z.object({
  invoiceId: z.string(),
  businessId: z.string(),
  customerId: z.string(),
  amountCents: z.number().int().positive(),
  currency: z.string().length(3),
  dueDate: z.string()
});

const issueInvoiceSchema = z.object({ invoiceId: z.string() });

const registerPaymentSchema = z.object({
  invoiceId: z.string(),
  paymentId: z.string(),
  amountCents: z.number().int().positive(),
  idempotencyKey: z.string().min(8)
});

const openWalletSchema = z.object({
  walletId: z.string(),
  businessId: z.string(),
  currency: z.string().length(3)
});

const walletMutationSchema = z.object({
  walletId: z.string(),
  transactionId: z.string(),
  amountCents: z.number().int().positive(),
  reference: z.string()
});

export const buildApp = async (container: AppContainer) => {
  const app = Fastify();


  //app.addHook('preHandler', authAndTenantMiddleware(container.tenantContextStore));
  app.addHook('onRequest', async (request, _reply) => {
    const span = container.telemetry.tracer.startSpan('http.request', {
      method: request.method,
      url: request.url
    });
    (request as { _spanEnd?: () => void })._spanEnd = span.end;
    container.telemetry.metrics.increment('http.requests_total', 1, {
      method: request.method
    });
  });

  app.addHook('onResponse', async (request, reply) => {
    (request as { _spanEnd?: () => void })._spanEnd?.();
    container.telemetry.metrics.observe('http.response_status', reply.statusCode, {
      method: request.method
    });
  });


  await app.register(swagger, {
    openapi: { info: { title: 'Shine Demo API', version: '1.0.0' } }
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.post('/customers', async (request, reply) => {
    try {
      const body = customerSchema.parse(request.body);
      await container.commands.createCustomer.execute(body);
      return reply.code(201).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post('/invoices', async (request, reply) => {
    try {
      const body = createInvoiceSchema.parse(request.body);
      await container.commands.createInvoice.execute(body);
      return reply.code(201).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post('/invoices/issue', async (request, reply) => {
    try {
      const body = issueInvoiceSchema.parse(request.body);
      await container.commands.issueInvoice.execute(body);
      return reply.code(202).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post('/invoices/payments', async (request, reply) => {
    try {
      const body = registerPaymentSchema.parse(request.body);
      await container.commands.registerPayment.execute(body);
      return reply.code(202).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get('/invoices/:invoiceId', async (request, reply) => {
    const params = z.object({ invoiceId: z.string() }).parse(request.params);
    const invoice = await container.queries.getInvoiceById.execute(params);
    if (!invoice) return reply.code(404).send({ message: 'Invoice not found' });
    return reply.send(invoice);
  });

  app.get('/invoices', async (request) => {
    const q = z.object({ businessId: z.string() }).parse(request.query);
    return container.queries.listOutstandingInvoices.execute(q);
  });

  app.post('/wallets', async (request, reply) => {
    try {
      const body = openWalletSchema.parse(request.body);
      await container.commands.openWallet.execute(body);
      return reply.code(201).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post('/wallets/deposit', async (request, reply) => {
    try {
      const body = walletMutationSchema.parse(request.body);
      await container.commands.depositFunds.execute(body);
      return reply.code(202).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post('/wallets/reserve', async (request, reply) => {
    try {
      const body = walletMutationSchema.parse(request.body);
      await container.commands.reserveFunds.execute(body);
      return reply.code(202).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post('/wallets/settle', async (request, reply) => {
    try {
      const body = walletMutationSchema.parse(request.body);
      await container.commands.settlePayment.execute(body);
      return reply.code(202).send({ ok: true });
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get('/wallets/:walletId/balance', async (request) => {
    const params = z.object({ walletId: z.string() }).parse(request.params);
    return container.queries.getWalletBalance.execute(params);
  });

  app.get('/wallets/:walletId/transactions', async (request) => {
    const params = z.object({ walletId: z.string() }).parse(request.params);
    return container.queries.getWalletTransactions.execute(params);
  });

  return app;
};

const mapError = (reply: { code: (code: number) => { send: (payload: unknown) => unknown } }, error: unknown) => {
  if (error instanceof z.ZodError) {
    return reply.code(400).send({ message: 'Validation failed', issues: error.issues });
  }
  if (error instanceof NotFoundError) {
    return reply.code(404).send({ message: error.message });
  }
  if (error instanceof DomainError) {
    return reply.code(409).send({ message: error.message });
  }
  return reply.code(500).send({ message: 'Internal error' });
};
