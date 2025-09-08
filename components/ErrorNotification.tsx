import React from 'react';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ErrorNotificationProps {
    message: string;
    type?: 'error' | 'warning' | 'info';
    onRetry?: () => void;
    onDismiss?: () => void;
    retryLabel?: string;
    className?: string;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
    message,
    type = 'error',
    onRetry,
    onDismiss,
    retryLabel = '再試行',
    className = ''
}) => {
    const baseClasses = 'rounded-lg p-4 border flex items-start gap-3';
    
    const typeClasses = {
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconClasses = {
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
            <AlertTriangleIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconClasses[type]}`} />
            
            <div className="flex-grow">
                <p className="text-sm font-medium">{message}</p>
                
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className={`mt-2 text-sm underline hover:no-underline transition-all ${
                            type === 'error' ? 'text-red-700 hover:text-red-800' :
                            type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' :
                            'text-blue-700 hover:text-blue-800'
                        }`}
                    >
                        {retryLabel}
                    </button>
                )}
            </div>
            
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className={`flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${iconClasses[type]}`}
                    aria-label="通知を閉じる"
                >
                    <XCircleIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default ErrorNotification;