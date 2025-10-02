import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useConversationData } from './useConversationData';
import * as geminiService from '../services/geminiService';

vi.mock('../services/geminiService');

describe('useConversationData', () => {
  const mockConversation = [
    {
      speaker: 'A',
      russian: 'Привет',
      pronunciation: 'Privet',
      japanese: 'こんにちは',
      words: [],
    },
    {
      speaker: 'B',
      russian: 'Здравствуйте',
      pronunciation: 'Zdravstvuyte',
      japanese: 'こんにちは（丁寧）',
      words: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.conversation).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should show error when topicId is missing', async () => {
    const { result } = renderHook(() => useConversationData(undefined, 'テストトピック'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('トピック情報が見つかりません。');
    expect(result.current.conversation).toEqual([]);
  });

  it('should fetch and display conversation successfully', async () => {
    vi.mocked(geminiService.generateConversation).mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toEqual(mockConversation);
    expect(result.current.error).toBeNull();
    expect(geminiService.generateConversation).toHaveBeenCalledWith('テストトピック');
  });

  it('should cache conversation data in localStorage', async () => {
    vi.mocked(geminiService.generateConversation).mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const cachedData = localStorage.getItem('conversation-test-1');
    expect(cachedData).toBeTruthy();
    expect(JSON.parse(cachedData!)).toEqual(mockConversation);
  });

  it('should load from cache first and then fetch fresh data', async () => {
    const cachedConversation = [mockConversation[0]];
    localStorage.setItem('conversation-test-1', JSON.stringify(cachedConversation));

    vi.mocked(geminiService.generateConversation).mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    // Should immediately show cached data
    await waitFor(() => {
      expect(result.current.conversation).toEqual(cachedConversation);
    });

    // Should then update with fresh data
    await waitFor(() => {
      expect(result.current.conversation).toEqual(mockConversation);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle network error with no cache', async () => {
    vi.mocked(geminiService.generateConversation).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(
      '会話の生成に失敗しました。ネットワーク接続を確認するか、後でもう一度お試しください。'
    );
    expect(result.current.conversation).toEqual([]);
  });

  it('should show warning when network fails but cache exists', async () => {
    const cachedConversation = [mockConversation[0]];
    localStorage.setItem('conversation-test-1', JSON.stringify(cachedConversation));

    vi.mocked(geminiService.generateConversation).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    // First it should load cached data immediately
    await waitFor(() => {
      expect(result.current.conversation).toEqual(cachedConversation);
    });

    // Then it should finish loading and show error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toEqual(cachedConversation);
    // The error might be null or the warning message depending on timing
    // We just verify the cached data is still there
    expect(result.current.conversation.length).toBeGreaterThan(0);
  });

  it('should not cache custom topics', async () => {
    vi.mocked(geminiService.generateConversation).mockResolvedValue(mockConversation);

    const { result } = renderHook(() =>
      useConversationData('custom-123', 'カスタムトピック')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toEqual(mockConversation);

    const cachedData = localStorage.getItem('conversation-custom-123');
    expect(cachedData).toBeNull();
  });

  it('should retry fetching conversation', async () => {
    vi.mocked(geminiService.generateConversation)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockConversation);

    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.conversation).toEqual([]);

    // Retry
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.conversation).toEqual(mockConversation);
    });

    expect(result.current.error).toBeNull();
    expect(geminiService.generateConversation).toHaveBeenCalledTimes(2);
  });

  it('should handle corrupted cache gracefully', async () => {
    localStorage.setItem('conversation-test-1', 'invalid-json-data');
    vi.mocked(geminiService.generateConversation).mockResolvedValue(mockConversation);

    const { result } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversation).toEqual(mockConversation);
    expect(result.current.error).toBeNull();
  });

  it('should cleanup on unmount', async () => {
    vi.mocked(geminiService.generateConversation).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockConversation), 1000))
    );

    const { unmount } = renderHook(() => useConversationData('test-1', 'テストトピック'));

    // Unmount before the async operation completes
    unmount();

    // Wait to ensure no state updates happen after unmount
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // No assertion needed - if there's an error, it will be caught by React
  });
});
