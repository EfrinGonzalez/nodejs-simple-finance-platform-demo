export interface ExternalBroker {
  publish(topic: string, payload: Record<string, unknown>): Promise<void>;
}
