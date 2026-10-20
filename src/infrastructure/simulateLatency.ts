export const DEFAULT_LATENCY_MS = 1000;

/** Espera simulada de un servicio remoto (001 FR-008, 002 FR-011). */
export function simulateLatency(ms: number = DEFAULT_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
