export interface TenantContext {
  tenantId: string;
  actorId: string;
}

export class TenantContextStore {
  private context: TenantContext | null = null;

  set(context: TenantContext): void {
    this.context = context;
  }

  get(): TenantContext {
    if (!this.context) {
      throw new Error('Tenant context not set');
    }
    return this.context;
  }
}
