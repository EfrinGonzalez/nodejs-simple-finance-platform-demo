import pino from 'pino';
import type { Logger } from '../application/logger.js';

export class ConsoleLogger implements Logger {
  private readonly logger = pino({ level: 'info' });

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.logger.error(context ?? {}, message);
  }
}
