export interface Tracer {
  startSpan(name: string, attributes?: Record<string, unknown>): { end: () => void };
}

export interface Metrics {
  increment(counter: string, value?: number, tags?: Record<string, string>): void;
  observe(histogram: string, value: number, tags?: Record<string, string>): void;
}

export interface Telemetry {
  tracer: Tracer;
  metrics: Metrics;
}
