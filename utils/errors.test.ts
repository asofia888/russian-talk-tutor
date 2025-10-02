import { describe, it, expect, vi } from 'vitest';
import {
  AppError,
  NetworkError,
  APIError,
  RateLimitError,
  ErrorType,
  classifyError,
  createErrorFromStatus,
  logError,
} from './errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(
        ErrorType.NETWORK,
        'Network failed',
        'ネットワークエラー',
        true
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.message).toBe('Network failed');
      expect(error.userMessage).toBe('ネットワークエラー');
      expect(error.retryable).toBe(true);
    });

    it('should default retryable to false', () => {
      const error = new AppError(
        ErrorType.VALIDATION,
        'Invalid input',
        'Invalid input'
      );

      expect(error.retryable).toBe(false);
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError with default message', () => {
      const error = new NetworkError();

      expect(error).toBeInstanceOf(NetworkError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.retryable).toBe(true);
    });

    it('should create a NetworkError with custom message', () => {
      const error = new NetworkError('Custom network error');

      expect(error.message).toBe('Custom network error');
      expect(error.userMessage).toBe('インターネット接続を確認してください。');
    });
  });

  describe('APIError', () => {
    it('should create an APIError with status code', () => {
      const error = new APIError(
        'Server error',
        'サーバーエラー',
        500,
        true
      );

      expect(error).toBeInstanceOf(APIError);
      expect(error.type).toBe(ErrorType.API);
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(true);
    });
  });

  describe('RateLimitError', () => {
    it('should create a RateLimitError', () => {
      const error = new RateLimitError(60);

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.type).toBe(ErrorType.RATE_LIMIT);
      expect(error.retryAfter).toBe(60);
      expect(error.retryable).toBe(true);
    });
  });
});

describe('classifyError', () => {
  it('should return AppError as is', () => {
    const original = new NetworkError();
    const classified = classifyError(original);

    expect(classified).toBe(original);
  });

  it('should classify network errors', () => {
    const error = new Error('Network request failed');
    const classified = classifyError(error);

    expect(classified).toBeInstanceOf(NetworkError);
  });

  it('should classify rate limit errors', () => {
    const error = new Error('rate limit exceeded');
    const classified = classifyError(error);

    expect(classified).toBeInstanceOf(RateLimitError);
  });

  it('should classify 429 errors as rate limit', () => {
    const error = new Error('Error 429');
    const classified = classifyError(error);

    expect(classified).toBeInstanceOf(RateLimitError);
  });

  it('should classify unauthorized errors', () => {
    const error = new Error('unauthorized access');
    const classified = classifyError(error);

    expect(classified.type).toBe(ErrorType.AUTH);
  });

  it('should classify unknown errors', () => {
    const error = new Error('Something went wrong');
    const classified = classifyError(error);

    expect(classified.type).toBe(ErrorType.UNKNOWN);
    expect(classified.retryable).toBe(false);
  });

  it('should handle non-Error objects', () => {
    const classified = classifyError('string error');

    expect(classified).toBeInstanceOf(AppError);
    expect(classified.message).toBe('string error');
  });
});

describe('createErrorFromStatus', () => {
  it('should create error for 400 Bad Request', () => {
    const error = createErrorFromStatus(400);

    expect(error).toBeInstanceOf(APIError);
    expect((error as APIError).statusCode).toBe(400);
    expect(error.retryable).toBe(false);
  });

  it('should create error for 401 Unauthorized', () => {
    const error = createErrorFromStatus(401);

    expect(error.type).toBe(ErrorType.AUTH);
  });

  it('should create error for 404 Not Found', () => {
    const error = createErrorFromStatus(404);

    expect(error).toBeInstanceOf(APIError);
    expect((error as APIError).statusCode).toBe(404);
  });

  it('should create error for 429 Rate Limit', () => {
    const error = createErrorFromStatus(429);

    expect(error).toBeInstanceOf(RateLimitError);
  });

  it('should create retryable error for 500 Server Error', () => {
    const error = createErrorFromStatus(500);

    expect(error).toBeInstanceOf(APIError);
    expect((error as APIError).statusCode).toBe(500);
    expect(error.retryable).toBe(true);
  });

  it('should create retryable error for 503 Service Unavailable', () => {
    const error = createErrorFromStatus(503);

    expect(error.retryable).toBe(true);
  });

  it('should handle custom message', () => {
    const error = createErrorFromStatus(500, 'Custom server error');

    expect(error.message).toBe('Custom server error');
  });
});

describe('logError', () => {
  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const error = new NetworkError();
    logError(error, 'test-context');

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Error]',
      expect.objectContaining({
        context: 'test-context',
        type: ErrorType.NETWORK,
      })
    );

    consoleSpy.mockRestore();
  });

  it('should classify and log non-AppError', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError(new Error('Test error'));

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
