import { useState, useCallback } from 'react';
import { AppError, classifyError } from '../utils/errors';

export interface ErrorRecoveryState {
  error: AppError | null;
  isRecovering: boolean;
  recoveryAttempts: number;
}

export interface ErrorRecoveryOptions {
  maxRecoveryAttempts?: number;
  onRecovery?: () => void;
  onRecoveryFailed?: (error: AppError) => void;
}

export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const {
    maxRecoveryAttempts = 3,
    onRecovery,
    onRecoveryFailed,
  } = options;

  const [state, setState] = useState<ErrorRecoveryState>({
    error: null,
    isRecovering: false,
    recoveryAttempts: 0,
  });

  // エラーの設定
  const setError = useCallback((error: unknown) => {
    const appError = classifyError(error);
    setState(prev => ({
      ...prev,
      error: appError,
      recoveryAttempts: 0,
    }));
  }, []);

  // エラーのクリア
  const clearError = useCallback(() => {
    setState({
      error: null,
      isRecovering: false,
      recoveryAttempts: 0,
    });
  }, []);

  // リカバリーの実行
  const recover = useCallback(
    async (recoveryFn: () => Promise<void>) => {
      if (!state.error) return;

      // 最大リトライ回数チェック
      if (state.recoveryAttempts >= maxRecoveryAttempts) {
        onRecoveryFailed?.(state.error);
        return;
      }

      setState(prev => ({
        ...prev,
        isRecovering: true,
        recoveryAttempts: prev.recoveryAttempts + 1,
      }));

      try {
        await recoveryFn();
        clearError();
        onRecovery?.();
      } catch (error) {
        const newError = classifyError(error);
        setState(prev => ({
          ...prev,
          error: newError,
          isRecovering: false,
        }));

        if (state.recoveryAttempts + 1 >= maxRecoveryAttempts) {
          onRecoveryFailed?.(newError);
        }
      }
    },
    [state.error, state.recoveryAttempts, maxRecoveryAttempts, clearError, onRecovery, onRecoveryFailed]
  );

  // 自動リカバリー戦略
  const autoRecover = useCallback(
    async (fn: () => Promise<void>) => {
      if (!state.error || !state.error.retryable) {
        return;
      }

      await recover(fn);
    },
    [state.error, recover]
  );

  return {
    ...state,
    setError,
    clearError,
    recover,
    autoRecover,
    canRetry: state.error?.retryable && state.recoveryAttempts < maxRecoveryAttempts,
  };
}

// エラーからの復旧戦略
export const recoveryStrategies = {
  // ページリロード
  reloadPage: () => {
    window.location.reload();
  },

  // キャッシュクリア
  clearCache: async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    localStorage.clear();
    sessionStorage.clear();
  },

  // Service Workerの再登録
  reregisterServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));

      // 再登録
      await navigator.serviceWorker.register('/service-worker.js');
    }
  },

  // オフラインデータのクリア
  clearOfflineData: () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('conversation-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};
