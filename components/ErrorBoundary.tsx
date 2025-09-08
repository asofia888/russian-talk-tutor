import React, { Component, ErrorInfo, ReactNode } from 'react';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
        });

        // ここで分析サービスにエラーを送信することも可能
        // analytics.track('Error', { error: error.message, stack: error.stack });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <AlertTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            申し訳ありません
                        </h2>
                        <p className="text-slate-600 mb-6">
                            予期しないエラーが発生しました。ページを再読み込みしてお試しください。
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                再試行
                            </button>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                ページを再読み込み
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                                    開発者向け情報を表示
                                </summary>
                                <div className="mt-2 p-4 bg-slate-100 rounded-lg text-xs font-mono overflow-auto">
                                    <p className="font-semibold text-red-600 mb-2">
                                        {this.state.error.message}
                                    </p>
                                    <pre className="whitespace-pre-wrap text-slate-700">
                                        {this.state.error.stack}
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