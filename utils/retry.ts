import { AppError, classifyError, logError } from './errors';

// リトライ設定
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: AppError, attempt: number) => boolean;
  onRetry?: (error: AppError, attempt: number, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: AppError) => error.retryable,
  onRetry: () => {},
};

// 指数バックオフでの遅延計算
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
  const jitter = Math.random() * 0.1 * delay; // 10%のジッター追加
  return Math.min(delay + jitter, maxDelay);
}

// sleep関数
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// リトライ機能付き非同期関数実行
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = classifyError(error);
      lastError = appError;

      // 最後の試行か、リトライ不可能なエラー
      if (attempt === config.maxAttempts || !config.shouldRetry(appError, attempt)) {
        logError(appError, `Failed after ${attempt} attempts`);
        throw appError;
      }

      // リトライ待機
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffFactor
      );

      config.onRetry(appError, attempt, delay);

      await sleep(delay);
    }
  }

  // TypeScriptの型チェックのため（実際にはここには到達しない）
  throw lastError || new Error('Unexpected error in retry logic');
}

// タイムアウト付き実行
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'リクエストがタイムアウトしました'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        const error = new Error(timeoutMessage);
        reject(classifyError(error));
      }, timeoutMs)
    ),
  ]);
}

// リトライ + タイムアウト
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return withRetry(
    () => withTimeout(fn, timeoutMs),
    retryOptions
  );
}

// オンライン状態チェック付きリトライ
export async function withOnlineRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(fn, {
    ...options,
    shouldRetry: (error, attempt) => {
      // オフラインの場合はリトライしない
      if (!navigator.onLine) {
        return false;
      }

      // カスタムshouldRetryがある場合はそれも考慮
      if (options.shouldRetry) {
        return options.shouldRetry(error, attempt);
      }

      return error.retryable;
    },
  });
}

// キューベースのリトライ（順次実行）
export class RetryQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  async add<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await withRetry(fn, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.isProcessing = false;
  }

  clear(): void {
    this.queue = [];
  }

  get length(): number {
    return this.queue.length;
  }
}

// サーキットブレーカーパターン
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1分
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('サービスが一時的に利用できません。しばらく待ってから再度お試しください。');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'half-open') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }

  getState(): string {
    return this.state;
  }
}
