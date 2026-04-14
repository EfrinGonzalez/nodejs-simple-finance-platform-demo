export interface OutboxMessage {
  id: string;
  topic: string;
  payload: Record<string, unknown>;
  attempts: number;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: string;
  lastError?: string;
}

export interface OutboxRepository {
  enqueue(message: OutboxMessage): Promise<void>;
  getPending(limit: number): Promise<OutboxMessage[]>;
  markSent(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
