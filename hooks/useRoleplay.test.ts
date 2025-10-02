import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRoleplay } from './useRoleplay';
import { ConversationLine } from '../types';
import * as geminiService from '../services/geminiService';

vi.mock('../services/geminiService');

describe('useRoleplay', () => {
  const mockLine: ConversationLine = {
    speaker: 'A',
    russian: 'Привет',
    pronunciation: 'Privet',
    japanese: 'こんにちは',
    words: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with selecting_role status', () => {
    const { result } = renderHook(() => useRoleplay());

    expect(result.current.status).toBe('selecting_role');
    expect(result.current.userRole).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentLineIndex).toBe(0);
  });

  it('should select role and change status to playing', () => {
    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('A');
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.userRole).toBe('A');
  });

  it('should add AI message correctly', () => {
    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('B');
    });

    act(() => {
      result.current.addAiMessage(mockLine);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]!).toMatchObject({
      speaker: 'A',
      text: 'Привет',
      pronunciation: 'Privet',
      isUser: false,
    });
    expect(result.current.currentLineIndex).toBe(1);
  });

  it('should add user message and fetch feedback', async () => {
    const mockFeedback = {
      is_correct: true,
      score: 95,
      text: 'Excellent pronunciation!',
    };

    vi.mocked(geminiService.getPronunciationFeedback).mockResolvedValue(mockFeedback);

    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('A');
    });

    await act(async () => {
      await result.current.addUserMessage('Privet', mockLine);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    const userMessage = result.current.messages[0]!;
    expect(userMessage.isUser).toBe(true);
    expect(userMessage.text).toBe('Privet');
    expect(userMessage.correctPhrase).toBe('Привет');
    expect(userMessage.isFeedbackLoading).toBe(false);
    expect(userMessage.feedback).toEqual(mockFeedback);
  });

  it('should handle feedback error gracefully', async () => {
    vi.mocked(geminiService.getPronunciationFeedback).mockRejectedValue(
      new Error('API Error')
    );

    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('A');
    });

    await act(async () => {
      await result.current.addUserMessage('Privet', mockLine);
    });

    await waitFor(() => {
      expect(result.current.messages[0]!.isFeedbackLoading).toBe(false);
    });

    const userMessage = result.current.messages[0]!;
    expect(userMessage.feedbackError).toBe('API Error');
    expect(userMessage.feedback).toBeUndefined();
  });

  it('should proceed to next line', () => {
    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('A');
    });

    const initialIndex = result.current.currentLineIndex;

    act(() => {
      result.current.proceedToNextLine();
    });

    expect(result.current.currentLineIndex).toBe(initialIndex + 1);
  });

  it('should end roleplay', () => {
    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('A');
    });

    act(() => {
      result.current.endRoleplay();
    });

    expect(result.current.status).toBe('ended');
  });

  it('should not add user message if transcript is empty', async () => {
    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('A');
    });

    await act(async () => {
      await result.current.addUserMessage('', mockLine);
    });

    expect(result.current.messages).toHaveLength(0);
    expect(geminiService.getPronunciationFeedback).not.toHaveBeenCalled();
  });

  it('should handle multiple messages in sequence', async () => {
    vi.mocked(geminiService.getPronunciationFeedback).mockResolvedValue({
      is_correct: true,
      score: 90,
      text: 'Good',
    });

    const { result } = renderHook(() => useRoleplay());

    act(() => {
      result.current.selectRole('A');
    });

    // Add AI message
    act(() => {
      result.current.addAiMessage(mockLine);
    });

    // Add user message
    await act(async () => {
      await result.current.addUserMessage('Privet', mockLine);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    expect(result.current.messages[0]!.isUser).toBe(false);
    expect(result.current.messages[1]!.isUser).toBe(true);
  });
});
