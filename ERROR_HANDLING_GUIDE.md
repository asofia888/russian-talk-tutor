# エラーハンドリングガイド

## 概要

Russian Talk Tutorアプリケーションに包括的なエラーハンドリングシステムを実装しました。このガイドでは、エラー処理の仕組みと使用方法について説明します。

## 主な機能

### 1. 統一されたエラー分類システム

すべてのエラーは`AppError`クラスとそのサブクラスに分類されます：

- **NetworkError**: ネットワーク接続の問題
- **APIError**: API呼び出しのエラー
- **RateLimitError**: レート制限エラー
- **ValidationError**: 入力検証エラー
- **AuthError**: 認証エラー

```typescript
import { classifyError, logError } from './utils/errors';

try {
  // 何かの処理
} catch (error) {
  const appError = classifyError(error);
  logError(appError, 'context-name');

  // エラーに応じた処理
  if (appError.retryable) {
    // リトライ可能
  }
}
```

### 2. 自動リトライメカニズム

指数バックオフを使用した自動リトライ機能を提供：

```typescript
import { withRetry, withRetryAndTimeout } from './utils/retry';

// 基本的なリトライ
const result = await withRetry(
  async () => {
    return await fetchData();
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    onRetry: (error, attempt, delay) => {
      console.log(`Retrying... (${attempt}/3)`);
    }
  }
);

// タイムアウト付きリトライ
const result = await withRetryAndTimeout(
  async () => {
    return await fetchData();
  },
  30000, // 30秒タイムアウト
  {
    maxAttempts: 3,
    initialDelay: 1000
  }
);
```

### 3. ネットワーク状態監視

リアルタイムでネットワーク状態を監視：

```typescript
import { useNetworkStatus } from './hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, wasOffline, reconnect } = useNetworkStatus();

  if (!isOnline) {
    return <div>オフラインです</div>;
  }

  return <div>オンラインです</div>;
}
```

### 4. エラー回復戦略

複数のエラー回復戦略を提供：

```typescript
import { useErrorRecovery, recoveryStrategies } from './hooks/useErrorRecovery';

function MyComponent() {
  const {
    error,
    isRecovering,
    recover,
    canRetry
  } = useErrorRecovery({
    maxRecoveryAttempts: 3,
    onRecovery: () => {
      console.log('Recovered!');
    }
  });

  // 自動回復
  const handleRetry = () => {
    recover(async () => {
      await fetchData();
    });
  };

  // キャッシュクリア
  const handleClearCache = () => {
    recoveryStrategies.clearCache();
  };
}
```

### 5. 改良されたErrorBoundary

より詳細な情報とリカバリーオプションを提供：

```typescript
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // カスタムエラーハンドリング
        console.error('Caught error:', error);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

**ErrorBoundaryの機能:**
- エラータイプに基づいたユーザーメッセージ
- リトライ可能なエラーの判定
- 複数回失敗時の高度なリカバリーオプション
- 開発環境での詳細なエラー情報表示

### 6. サーキットブレーカーパターン

連続したエラーからシステムを保護：

```typescript
import { CircuitBreaker } from './utils/retry';

const breaker = new CircuitBreaker(5, 60000); // 5回失敗で1分間オープン

async function callAPI() {
  return await breaker.execute(async () => {
    return await fetch('/api/data');
  });
}
```

## 実装例

### API呼び出しのエラーハンドリング

`services/geminiService.ts`では、以下のように実装されています：

```typescript
export const generateConversation = async (topic: string): Promise<ConversationLine[]> => {
  try {
    return await withRetryAndTimeout(
      async () => {
        const response = await fetch('/api/generate-conversation', {
          method: 'POST',
          body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
          const error: any = new Error('Failed to generate conversation');
          error.status = response.status;
          throw error;
        }

        return await response.json();
      },
      30000, // 30秒タイムアウト
      {
        maxAttempts: 3,
        initialDelay: 1000,
        onRetry: (error, attempt, delay) => {
          console.log(`Retrying... (${attempt}/3)`);
        }
      }
    );
  } catch (error) {
    const classifiedError = classifyError(error);
    logError(classifiedError, 'generateConversation');
    throw classifiedError;
  }
};
```

### コンポーネントでのエラーハンドリング

```typescript
import { useState } from 'react';
import { useErrorRecovery } from '../hooks/useErrorRecovery';

function MyComponent() {
  const [data, setData] = useState(null);
  const { error, setError, recover, canRetry } = useErrorRecovery();

  const fetchData = async () => {
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err);
    }
  };

  if (error) {
    return (
      <div>
        <p>{error.userMessage}</p>
        {canRetry && (
          <button onClick={() => recover(fetchData)}>
            再試行
          </button>
        )}
      </div>
    );
  }

  return <div>{/* データ表示 */}</div>;
}
```

## ベストプラクティス

1. **常にエラーを分類する**
   ```typescript
   const appError = classifyError(error);
   ```

2. **ユーザーフレンドリーなメッセージを表示**
   ```typescript
   <p>{error.userMessage}</p>
   ```

3. **リトライ可能なエラーを判定**
   ```typescript
   if (error.retryable) {
     // リトライ処理
   }
   ```

4. **適切なタイムアウトを設定**
   ```typescript
   await withTimeout(fn, 30000); // 30秒
   ```

5. **エラーをログに記録**
   ```typescript
   logError(error, 'component-name');
   ```

## テスト

エラーハンドリングシステムには包括的なテストが含まれています：

```bash
# エラーユーティリティのテスト
npm test utils/errors.test.ts

# リトライメカニズムのテスト
npm test utils/retry.test.ts

# すべてのテストを実行
npm test
```

現在のテストカバレッジ：
- **utils/errors.ts**: 12テスト ✅
- **utils/retry.ts**: 16テスト ✅
- **総テスト数**: 109テスト（全て合格）

## エラータイプとHTTPステータスコードの対応

| HTTPステータス | エラータイプ | リトライ可能 |
|--------------|------------|------------|
| 400 | APIError | ❌ |
| 401 | AuthError | ❌ |
| 403 | AuthError | ❌ |
| 404 | APIError | ❌ |
| 429 | RateLimitError | ✅ |
| 500-504 | APIError | ✅ |
| Network Errors | NetworkError | ✅ |
| Timeout | NetworkError | ✅ |

## トラブルシューティング

### よくある問題と解決方法

1. **リトライが無限ループする**
   - `maxAttempts`を適切に設定
   - `shouldRetry`で条件を制限

2. **タイムアウトが早すぎる**
   - ネットワーク環境に応じてタイムアウト値を調整
   - 複雑な処理には長めのタイムアウトを設定

3. **エラーメッセージが不明確**
   - `classifyError`で適切なエラータイプに分類
   - カスタム`userMessage`を設定

## 今後の改善予定

- [ ] Sentryなど外部エラートラッキングサービスとの統合
- [ ] エラー統計ダッシュボード
- [ ] より詳細なエラー分類
- [ ] オフライン時の操作キュー機能
- [ ] エラーレポート機能

---

**最終更新**: 2025-10-02
