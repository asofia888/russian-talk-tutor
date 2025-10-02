import React, { useState, useEffect } from 'react';
import { useNetworkStatus, getNetworkQuality } from '../hooks/useNetworkStatus';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

const NetworkStatusBanner: React.FC = () => {
  const { isOnline, wasOffline, effectiveType, reconnect } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const networkQuality = getNetworkQuality(effectiveType);

  // 再接続メッセージの表示管理
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        reconnect(); // wasOfflineフラグをクリア
      }, 3000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline, wasOffline, reconnect]);

  // Always return JSX or null for type safety
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5" />
            <span className="font-semibold">オフラインモード</span>
            <span className="text-sm">
              インターネット接続がありません。一部の機能が制限されます。
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-3 shadow-lg animate-slide-down">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-semibold">ネットワークに再接続しました</span>
        </div>
      </div>
    );
  }

  if (networkQuality === 'poor') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <AlertTriangleIcon className="w-4 h-4" />
          <span className="text-sm">
            ネットワーク速度が遅い可能性があります。読み込みに時間がかかる場合があります。
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default NetworkStatusBanner;
