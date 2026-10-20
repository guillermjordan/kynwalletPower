import { DEFAULT_LATENCY_MS, simulateLatency } from './simulateLatency';

describe('simulateLatency (FR-008 de 001, FR-011 de 002)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('espera 1000 ms por defecto', async () => {
    vi.useFakeTimers();
    expect(DEFAULT_LATENCY_MS).toBe(1000);
    const onResolve = vi.fn();
    void simulateLatency().then(onResolve);
    await vi.advanceTimersByTimeAsync(999);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledOnce();
  });

  it('respeta el valor inyectado', async () => {
    vi.useFakeTimers();
    const onResolve = vi.fn();
    void simulateLatency(10).then(onResolve);
    await vi.advanceTimersByTimeAsync(10);
    expect(onResolve).toHaveBeenCalledOnce();
  });
});
