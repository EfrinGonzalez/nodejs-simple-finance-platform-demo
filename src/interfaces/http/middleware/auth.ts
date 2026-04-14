import type { FastifyReply, FastifyRequest } from 'fastify';
import type { TenantContextStore } from '../../../shared/security/tenant-context.js';

const INTERNAL_DEMO_API_KEY = 'shine-demo-secret';

export const authAndTenantMiddleware =
  (tenantContextStore: TenantContextStore) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const apiKey = request.headers['x-api-key'];
    const tenantId = request.headers['x-tenant-id'];
    const actorId = request.headers['x-actor-id'] ?? 'system';

    if (apiKey !== INTERNAL_DEMO_API_KEY) {
      await reply.code(401).send({ message: 'Unauthorized' });
      return;
    }

    if (!tenantId || typeof tenantId !== 'string') {
      await reply.code(400).send({ message: 'Missing x-tenant-id header' });
      return;
    }

    tenantContextStore.set({ tenantId, actorId: String(actorId) });
  };
