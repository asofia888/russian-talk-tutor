import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from './FavoritesContext';
import { Word } from '../types';
import React from 'react';

describe('FavoritesContext', () => {
  const mockWord: Word = {
    russian: 'Привет',
    pronunciation: 'Privet',
    japanese: 'こんにちは',
  };

  const mockWord2: Word = {
    russian: 'Спасибо',
    pronunciation: 'Spasibo',
    japanese: 'ありがとう',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FavoritesProvider>{children}</FavoritesProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useFavorites());
    }).toThrow('useFavorites must be used within a FavoritesProvider');
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.reviewQueueCount).toBe(0);
  });

  it('should add a favorite word', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]!).toMatchObject({
      russian: 'Привет',
      pronunciation: 'Privet',
      japanese: 'こんにちは',
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
    });
    expect(result.current.favorites[0]!.nextReviewDate).toBeDefined();
  });

  it('should not add duplicate favorites', () => {
    const { result, unmount } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    expect(result.current.favorites).toHaveLength(1);
    unmount();
  });

  it('should remove a favorite word', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    expect(result.current.favorites).toHaveLength(1);

    act(() => {
      result.current.removeFavorite('Привет');
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it('should check if a word is favorite', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.isFavorite('Привет')).toBe(false);

    act(() => {
      result.current.addFavorite(mockWord);
    });

    expect(result.current.isFavorite('Привет')).toBe(true);
  });

  it('should sort favorites alphabetically in Russian', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord2); // Спасибо
      result.current.addFavorite(mockWord); // Привет
    });

    expect(result.current.favorites[0]!.russian).toBe('Привет');
    expect(result.current.favorites[1]!.russian).toBe('Спасибо');
  });

  it('should update favorite with "again" performance', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    const initialWord = result.current.favorites[0]!;

    act(() => {
      result.current.updateFavorite('Привет', 'again');
    });

    const updatedWord = result.current.favorites[0]!;

    expect(updatedWord.repetition).toBe(0);
    expect(updatedWord.interval).toBe(1);
    expect(updatedWord.easeFactor).toBe(initialWord.easeFactor); // unchanged
  });

  it('should update favorite with "good" performance - first repetition', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });

    const updatedWord = result.current.favorites[0]!;

    expect(updatedWord.repetition).toBe(1);
    expect(updatedWord.interval).toBe(1);
    expect(updatedWord.easeFactor).toBe(2.5); // unchanged for 'good'
  });

  it('should update favorite with "good" performance - second repetition', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });

    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });

    const updatedWord = result.current.favorites[0]!;

    expect(updatedWord.repetition).toBe(2);
    expect(updatedWord.interval).toBe(6);
  });

  it('should update favorite with "easy" performance and increase easeFactor', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    const initialEaseFactor = result.current.favorites[0]!.easeFactor;

    act(() => {
      result.current.updateFavorite('Привет', 'easy');
    });

    const updatedWord = result.current.favorites[0]!;

    expect(updatedWord.repetition).toBe(1);
    expect(updatedWord.easeFactor).toBe(initialEaseFactor + 0.15);
  });

  it('should calculate interval correctly for multiple repetitions', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    // First repetition: interval = 1
    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });
    expect(result.current.favorites[0]!.interval).toBe(1);

    // Second repetition: interval = 6
    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });
    expect(result.current.favorites[0]!.interval).toBe(6);

    // Third repetition: interval = ceil(6 * 2.5) = 15
    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });
    expect(result.current.favorites[0]!.interval).toBe(15);
  });

  it('should calculate reviewQueueCount correctly', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
      result.current.addFavorite(mockWord2);
    });

    // Both should be due today (initial state)
    expect(result.current.reviewQueueCount).toBe(2);

    // Mark one as reviewed with good performance
    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });

    // Now only one should be due
    expect(result.current.reviewQueueCount).toBe(1);
  });

  it('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    const stored = localStorage.getItem('favoriteWords-v2-russian');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]!.russian).toBe('Привет');
  });

  it('should load favorites from localStorage on mount', () => {
    const mockFavorite = {
      russian: 'Привет',
      pronunciation: 'Privet',
      japanese: 'こんにちは',
      repetition: 1,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
    };

    localStorage.setItem('favoriteWords-v2-russian', JSON.stringify([mockFavorite]));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]!.russian).toBe('Привет');
  });

  it('should not update non-existent favorite', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    const initialLength = result.current.favorites.length;

    act(() => {
      result.current.updateFavorite('NonExistent', 'good');
    });

    expect(result.current.favorites).toHaveLength(initialLength);
  });

  it('should set nextReviewDate to future date after update', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(mockWord);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    act(() => {
      result.current.updateFavorite('Привет', 'good');
    });

    const updatedWord = result.current.favorites[0]!;
    const nextReviewDate = new Date(updatedWord.nextReviewDate);

    expect(nextReviewDate.getTime()).toBeGreaterThan(today.getTime());
  });
});
