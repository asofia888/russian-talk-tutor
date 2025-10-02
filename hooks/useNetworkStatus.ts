import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface UseNetworkStatusReturn extends NetworkStatus {
  reconnect: () => void;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  }>({});

  // ネットワーク情報の更新
  const updateNetworkInfo = useCallback(() => {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (connection) {
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });
    }
  }, []);

  // オンライン状態の処理
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    updateNetworkInfo();

    // 再接続メッセージの表示
    if (wasOffline) {
      console.log('ネットワークに再接続しました');
    }
  }, [wasOffline, updateNetworkInfo]);

  // オフライン状態の処理
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
    console.warn('ネットワーク接続が切断されました');
  }, []);

  // 手動再接続
  const reconnect = useCallback(() => {
    if (!navigator.onLine) {
      console.warn('ネットワークに接続されていません');
      return;
    }

    setWasOffline(false);
    updateNetworkInfo();
  }, [updateNetworkInfo]);

  useEffect(() => {
    // 初回のネットワーク情報取得
    updateNetworkInfo();

    // イベントリスナーの設定
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API のリスナー
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // クリーンアップ
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [handleOnline, handleOffline, updateNetworkInfo]);

  return {
    isOnline,
    wasOffline,
    reconnect,
    ...networkInfo,
  };
}

// ネットワーク品質の判定
export function getNetworkQuality(effectiveType?: string): 'good' | 'moderate' | 'poor' | 'unknown' {
  if (!effectiveType) return 'unknown';

  switch (effectiveType) {
    case '4g':
      return 'good';
    case '3g':
      return 'moderate';
    case '2g':
    case 'slow-2g':
      return 'poor';
    default:
      return 'unknown';
  }
}
