import { ConversationLine, Feedback } from '../types';
import { withRetryAndTimeout } from '../utils/retry';
import {
    APIError,
    NetworkError,
    RateLimitError,
    createErrorFromStatus,
    classifyError as globalClassifyError,
    logError
} from '../utils/errors';

// レガシーエラータイプ（後方互換性のため）
export enum APIErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    API_KEY_ERROR = 'API_KEY_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// エラーの分類とメッセージの生成
function classifyError(error: any): Error {
    // ネットワークエラー
    if (!navigator.onLine) {
        return new NetworkError('インターネット接続を確認してください。オフラインでは一部の機能が利用できません。');
    }

    // HTTPステータスコードがある場合
    if (error?.status) {
        return createErrorFromStatus(error.status, error.message);
    }

    // APIキーエラー
    if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
        return new APIError(
            'API authentication failed',
            'APIキーの設定に問題があります。管理者にお問い合わせください。',
            401,
            false
        );
    }

    // クォータ超過
    if (error?.message?.includes('quota') || error?.message?.includes('limit') || error?.message?.includes('rate limit')) {
        return new RateLimitError();
    }

    // タイムアウト
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
        return new NetworkError('リクエストがタイムアウトしました。ネットワーク接続を確認して再度お試しください。');
    }

    // その他のエラーはグローバル分類を使用
    return globalClassifyError(error);
}

// API endpoint base URL
const getApiBaseUrl = (): string => {
    // 開発環境の場合はローカルのVercel Dev Serverを使用
    if (import.meta.env.DEV) {
        return 'http://localhost:3000';
    }
    // 本番環境の場合は相対パスを使用（同じドメイン）
    return '';
};

export const generateConversation = async (topic: string): Promise<ConversationLine[]> => {
    try {
        return await withRetryAndTimeout(
            async () => {
                const apiUrl = `${getApiBaseUrl()}/api/generate-conversation`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ topic }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    const error: any = new Error(errorData.error || 'Failed to generate conversation');
                    error.status = response.status;
                    throw error;
                }

                const conversation = await response.json();

                if (!Array.isArray(conversation) || conversation.length === 0) {
                    throw new Error('無効な会話データを受信しました。');
                }

                return conversation as ConversationLine[];
            },
            30000, // 30秒タイムアウト
            {
                maxAttempts: 3,
                initialDelay: 1000,
                onRetry: (error, attempt, delay) => {
                    console.log(`会話生成をリトライします (${attempt}/3)。${Math.round(delay / 1000)}秒後に再試行...`);
                }
            }
        );
    } catch (error) {
        const classifiedError = classifyError(error);
        logError(classifiedError, 'generateConversation');
        throw classifiedError;
    }
};

export const getPronunciationFeedback = async (transcript: string, correctPhrase: string): Promise<Feedback> => {
    try {
        return await withRetryAndTimeout(
            async () => {
                const apiUrl = `${getApiBaseUrl()}/api/pronunciation-feedback`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ transcript, correctPhrase }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    const error: any = new Error(errorData.error || 'Failed to generate feedback');
                    error.status = response.status;
                    throw error;
                }

                const feedback = await response.json();

                if (!feedback || typeof feedback.score !== 'number' || typeof feedback.feedback !== 'string') {
                    throw new Error('無効なフィードバックデータを受信しました。');
                }

                return feedback as Feedback;
            },
            15000, // 15秒タイムアウト
            {
                maxAttempts: 2, // フィードバックは重要度が低いため、リトライ回数を減らす
                initialDelay: 500,
                onRetry: (error, attempt, delay) => {
                    console.log(`発音フィードバックをリトライします (${attempt}/2)...`);
                }
            }
        );
    } catch (error) {
        const classifiedError = classifyError(error);
        logError(classifiedError, 'getPronunciationFeedback');
        throw classifiedError;
    }
};