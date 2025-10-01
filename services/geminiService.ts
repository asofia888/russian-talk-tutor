import { ConversationLine, Feedback } from '../types';

// エラーの種類を定義
export enum APIErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    API_KEY_ERROR = 'API_KEY_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class APIError extends Error {
    public readonly type: APIErrorType;
    public readonly originalError: any;
    public readonly retryable: boolean;

    constructor(type: APIErrorType, message: string, originalError?: any) {
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.originalError = originalError;
        this.retryable = this.isRetryable(type);
    }

    private isRetryable(type: APIErrorType): boolean {
        return [APIErrorType.NETWORK_ERROR, APIErrorType.TIMEOUT_ERROR].includes(type);
    }
}

// エラーの分類とメッセージの生成
function classifyError(error: any): APIError {
    // ネットワークエラー
    if (!navigator.onLine) {
        return new APIError(
            APIErrorType.NETWORK_ERROR,
            'インターネット接続を確認してください。オフラインでは一部の機能が利用できません。',
            error
        );
    }

    // APIキーエラー
    if (error?.status === 401 || error?.message?.includes('API key') || error?.message?.includes('authentication')) {
        return new APIError(
            APIErrorType.API_KEY_ERROR,
            'APIキーの設定に問題があります。管理者にお問い合わせください。',
            error
        );
    }

    // クォータ超過
    if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('limit') || error?.message?.includes('rate limit')) {
        return new APIError(
            APIErrorType.QUOTA_EXCEEDED,
            'APIの利用制限に達しました。しばらく時間をおいてから再度お試しください。',
            error
        );
    }

    // リクエストエラー
    if (error?.status >= 400 && error?.status < 500) {
        return new APIError(
            APIErrorType.INVALID_REQUEST,
            'リクエストに問題があります。ページを再読み込みしてお試しください。',
            error
        );
    }

    // タイムアウト
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
        return new APIError(
            APIErrorType.TIMEOUT_ERROR,
            'リクエストがタイムアウトしました。ネットワーク接続を確認して再度お試しください。',
            error
        );
    }

    // その他のエラー
    return new APIError(
        APIErrorType.UNKNOWN_ERROR,
        '予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。',
        error
    );
}

// リトライ機能付きのAPI呼び出し
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: APIError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = classifyError(error);

            // 最後の試行、またはリトライ不可能なエラーの場合は即座にthrow
            if (attempt === maxRetries || !lastError.retryable) {
                throw lastError;
            }

            // 指数バックオフでリトライ
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
        }
    }

    throw lastError!;
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
    return withRetry(async () => {
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
    });
};

export const getPronunciationFeedback = async (transcript: string, correctPhrase: string): Promise<Feedback> => {
    return withRetry(async () => {
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
    }, 2); // フィードバックは重要度が低いため、リトライ回数を減らす
};