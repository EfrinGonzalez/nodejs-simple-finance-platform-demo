import type { Metrics, Telemetry, Tracer } from './telemetry.js';

class ConsoleTracer implements Tracer {
  startSpan(name: string, attributes?: Record<string, unknown>): { end: () => void } {
    const startedAt = Date.now();
    return {
      end: () => {
        const durationMs = Date.now() - startedAt;
        console.info('[trace]', { name, durationMs, ...attributes });
      }
    };
  }
}

class InMemoryMetrics implements Metrics {
  increment(counter: string, value = 1, tags?: Record<string, string>): void {
    console.info('[metric:increment]', { counter, value, tags });
  }

  observe(histogram: string, value: number, tags?: Record<string, string>): void {
    console.info('[metric:observe]', { histogram, value, tags });
  }
}

export class ConsoleTelemetry implements Telemetry {
  tracer: Tracer = new ConsoleTracer();
  metrics: Metrics = new InMemoryMetrics();
}
