// エラータイプの定義
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

// カスタムエラークラス
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly userMessage: string;
  public readonly originalError?: Error;
  public readonly retryable: boolean;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    retryable: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.userMessage = userMessage;
    this.retryable = retryable;
    this.originalError = originalError;

    // プロトタイプチェーンの修正
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ネットワークエラー
export class NetworkError extends AppError {
  constructor(message: string = 'ネットワークエラーが発生しました', originalError?: Error) {
    super(
      ErrorType.NETWORK,
      message,
      'インターネット接続を確認してください。',
      true,
      originalError
    );
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

// APIエラー
export class APIError extends AppError {
  public readonly statusCode?: number;

  constructor(
    message: string,
    userMessage: string,
    statusCode?: number,
    retryable: boolean = false,
    originalError?: Error
  ) {
    super(ErrorType.API, message, userMessage, retryable, originalError);
    this.name = 'APIError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

// レート制限エラー
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number, originalError?: Error) {
    super(
      ErrorType.RATE_LIMIT,
      'API rate limit exceeded',
      '利用上限に達しました。しばらく待ってから再度お試しください。',
      true,
      originalError
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// エラー分類ユーティリティ
export function classifyError(error: unknown): AppError {
  // すでに分類されているエラー
  if (error instanceof AppError) {
    return error;
  }

  // 標準エラー
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // ネットワークエラー
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return new NetworkError(error.message, error);
    }

    // レート制限
    if (message.includes('rate limit') || message.includes('429')) {
      return new RateLimitError(undefined, error);
    }

    // 認証エラー
    if (message.includes('unauthorized') || message.includes('401')) {
      return new AppError(
        ErrorType.AUTH,
        error.message,
        '認証エラーが発生しました。アプリを再読み込みしてください。',
        false,
        error
      );
    }

    // その他のエラー
    return new AppError(
      ErrorType.UNKNOWN,
      error.message,
      '予期しないエラーが発生しました。',
      false,
      error
    );
  }

  // 不明なエラー
  return new AppError(
    ErrorType.UNKNOWN,
    String(error),
    '予期しないエラーが発生しました。',
    false
  );
}

// HTTPステータスコードからエラーを生成
export function createErrorFromStatus(
  statusCode: number,
  message?: string
): AppError {
  const defaultMessage = message || `HTTPエラー: ${statusCode}`;

  switch (statusCode) {
    case 400:
      return new APIError(
        defaultMessage,
        'リクエストが無効です。入力内容を確認してください。',
        statusCode,
        false
      );
    case 401:
      return new AppError(
        ErrorType.AUTH,
        defaultMessage,
        '認証エラーが発生しました。',
        false
      );
    case 403:
      return new AppError(
        ErrorType.AUTH,
        defaultMessage,
        'アクセス権限がありません。',
        false
      );
    case 404:
      return new APIError(
        defaultMessage,
        'リソースが見つかりませんでした。',
        statusCode,
        false
      );
    case 429:
      return new RateLimitError();
    case 500:
    case 502:
    case 503:
    case 504:
      return new APIError(
        defaultMessage,
        'サーバーエラーが発生しました。しばらく待ってから再度お試しください。',
        statusCode,
        true
      );
    default:
      return new APIError(
        defaultMessage,
        '予期しないエラーが発生しました。',
        statusCode,
        statusCode >= 500
      );
  }
}

// エラーログ記録
export function logError(error: unknown, context?: string): void {
  const appError = classifyError(error);

  console.error('[Error]', {
    context,
    type: appError.type,
    message: appError.message,
    userMessage: appError.userMessage,
    retryable: appError.retryable,
    originalError: appError.originalError,
    timestamp: new Date().toISOString(),
  });

  // 本番環境では、ここで外部エラートラッキングサービス（Sentry等）に送信
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(appError);
  // }
}
