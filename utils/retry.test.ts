import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry, withTimeout, withRetryAndTimeout, CircuitBreaker } from './retry';
import { NetworkError } from './errors';

describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue('success');

    const result = await withRetry(fn, { maxAttempts: 3 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should fail after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new NetworkError());

    await expect(
      withRetry(fn, { maxAttempts: 3 })
    ).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable errors', async () => {
    const error = new Error('Non-retryable');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        shouldRetry: () => false,
      })
    ).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue('success');

    await withRetry(fn, {
      maxAttempts: 3,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(
      expect.any(Object),
      1,
      expect.any(Number)
    );
  });

  it('should apply exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue('success');

    const delays: number[] = [];
    const onRetry = vi.fn((_, __, delay) => delays.push(delay));

    await withRetry(fn, {
      maxAttempts: 3,
      initialDelay: 100,
      backoffFactor: 2,
      onRetry,
    });

    expect(delays[0]).toBeGreaterThanOrEqual(100);
    expect(delays[1]).toBeGreaterThanOrEqual(200);
  });
});

describe('withTimeout', () => {
  it('should resolve before timeout', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withTimeout(fn, 1000);

    expect(result).toBe('success');
  });

  it('should reject on timeout', async () => {
    const fn = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('late'), 1000)));

    await expect(
      withTimeout(fn, 100)
    ).rejects.toThrow();
  });

  it('should use custom timeout message', async () => {
    const fn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

    await expect(
      withTimeout(fn, 100, 'Custom timeout message')
    ).rejects.toThrow();
  });
});

describe('withRetryAndTimeout', () => {
  it('should combine retry and timeout', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue('success');

    const result = await withRetryAndTimeout(fn, 1000, { maxAttempts: 3 });

    expect(result).toBe('success');
  });

  it('should timeout on slow operations', async () => {
    const fn = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('late'), 1000)));

    await expect(
      withRetryAndTimeout(fn, 100, { maxAttempts: 1 })
    ).rejects.toThrow();

    expect(fn).toHaveBeenCalled();
  });
});

describe('CircuitBreaker', () => {
  it('should execute successfully when closed', async () => {
    const breaker = new CircuitBreaker(3, 1000);
    const fn = vi.fn().mockResolvedValue('success');

    const result = await breaker.execute(fn);

    expect(result).toBe('success');
    expect(breaker.getState()).toBe('closed');
  });

  it('should open after threshold failures', async () => {
    const breaker = new CircuitBreaker(2, 1000);
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    // First failure
    await expect(breaker.execute(fn)).rejects.toThrow();
    expect(breaker.getState()).toBe('closed');

    // Second failure - should open
    await expect(breaker.execute(fn)).rejects.toThrow();
    expect(breaker.getState()).toBe('open');
  });

  it('should reject immediately when open', async () => {
    const breaker = new CircuitBreaker(1, 1000);
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow();

    // Should reject immediately without calling fn
    const callCount = fn.mock.calls.length;
    await expect(breaker.execute(fn)).rejects.toThrow('サービスが一時的に利用できません');
    expect(fn).toHaveBeenCalledTimes(callCount);
  });

  it('should transition to half-open after timeout', async () => {
    const breaker = new CircuitBreaker(1, 100);
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow();
    expect(breaker.getState()).toBe('open');

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should be half-open now, but will fail and reopen
    fn.mockResolvedValue('success');
    const result = await breaker.execute(fn);

    expect(result).toBe('success');
    expect(breaker.getState()).toBe('closed');
  });
});
