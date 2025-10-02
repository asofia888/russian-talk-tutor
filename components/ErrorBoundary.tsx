import React, { Component, ErrorInfo, ReactNode } from 'react';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import { AppError, classifyError, logError } from '../utils/errors';
import { recoveryStrategies } from '../hooks/useErrorRecovery';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: AppError, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: AppError;
    errorInfo?: ErrorInfo;
    retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, retryCount: 0 };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        const appError = classifyError(error);
        return {
            hasError: true,
            error: appError,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const appError = classifyError(error);

        logError(appError, 'ErrorBoundary');

        this.setState({
            error: appError,
            errorInfo,
        });

        // カスタムエラーハンドラー呼び出し
        this.props.onError?.(appError, errorInfo);
    }

    handleRetry = () => {
        this.setState(prev => ({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            retryCount: prev.retryCount + 1,
        }));
    };

    handleClearCache = async () => {
        try {
            await recoveryStrategies.clearCache();
            window.location.reload();
        } catch (error) {
            console.error('Failed to clear cache:', error);
            window.location.reload();
        }
    };

    handleReload = () => {
        recoveryStrategies.reloadPage();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error, retryCount } = this.state;
            const showAdvancedRecovery = retryCount >= 2;

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <AlertTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            申し訳ありません
                        </h2>
                        <p className="text-slate-600 mb-2">
                            {error?.userMessage || '予期しないエラーが発生しました。'}
                        </p>

                        {showAdvancedRecovery && (
                            <p className="text-sm text-slate-500 mb-6">
                                問題が解決しない場合は、キャッシュをクリアしてみてください。
                            </p>
                        )}

                        <div className="space-y-3">
                            {error?.retryable && (
                                <button
                                    onClick={this.handleRetry}
                                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    再試行
                                </button>
                            )}

                            <button
                                onClick={this.handleReload}
                                className="w-full px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                ページを再読み込み
                            </button>

                            {showAdvancedRecovery && (
                                <button
                                    onClick={this.handleClearCache}
                                    className="w-full px-6 py-3 bg-amber-100 text-amber-800 font-semibold rounded-lg hover:bg-amber-200 transition-colors"
                                >
                                    キャッシュをクリアして再読み込み
                                </button>
                            )}
                        </div>

                        {import.meta.env.DEV && error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                                    開発者向け情報を表示
                                </summary>
                                <div className="mt-2 p-4 bg-slate-100 rounded-lg text-xs font-mono overflow-auto">
                                    <p className="font-semibold text-red-600 mb-2">
                                        Type: {error.type}
                                    </p>
                                    <p className="font-semibold text-red-600 mb-2">
                                        {error.message}
                                    </p>
                                    <pre className="whitespace-pre-wrap text-slate-700">
                                        {error.stack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;