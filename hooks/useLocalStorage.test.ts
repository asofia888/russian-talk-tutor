import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with the initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    expect(result.current[0]).toBe('initial-value');
  });

  it('should initialize with stored value when it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('should work with complex objects', () => {
    const initialObject = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('test-object', initialObject));

    expect(result.current[0]).toEqual(initialObject);

    const updatedObject = { name: 'Updated', count: 5 };
    act(() => {
      result.current[1](updatedObject);
    });

    expect(result.current[0]).toEqual(updatedObject);
    expect(JSON.parse(localStorage.getItem('test-object')!)).toEqual(updatedObject);
  });

  it('should work with arrays', () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('test-array', initialArray));

    expect(result.current[0]).toEqual(initialArray);

    act(() => {
      result.current[1]([...initialArray, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('should work with boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('test-bool', false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('test-bool')).toBe('true');
  });

  it('should work with numeric values', () => {
    const { result } = renderHook(() => useLocalStorage('test-number', 42));

    expect(result.current[0]).toBe(42);

    act(() => {
      result.current[1](100);
    });

    expect(result.current[0]).toBe(100);
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json{');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle localStorage quota exceeded gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create a local mock for this specific test
    const mockSetItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });

    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = mockSetItem;

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    await act(async () => {
      result.current[1]('new-value');
      // Wait for effect to run
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Value should still update in state
    expect(result.current[0]).toBe('new-value');
    expect(mockSetItem).toHaveBeenCalled();

    // Restore
    window.localStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  it('should persist across re-renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    rerender();

    expect(result.current[0]).toBe('updated');
  });

  it('should use different keys for different instances', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
    const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

    expect(result1.current[0]).toBe('value1');
    expect(result2.current[0]).toBe('value2');

    act(() => {
      result1.current[1]('updated1');
    });

    expect(result1.current[0]).toBe('updated1');
    expect(result2.current[0]).toBe('value2');
  });

  it('should sync when the same key is used in multiple hooks', () => {
    localStorage.setItem('shared-key', JSON.stringify('shared-value'));

    const { result: result1 } = renderHook(() => useLocalStorage('shared-key', 'default'));
    const { result: result2 } = renderHook(() => useLocalStorage('shared-key', 'default'));

    expect(result1.current[0]).toBe('shared-value');
    expect(result2.current[0]).toBe('shared-value');
  });
});
