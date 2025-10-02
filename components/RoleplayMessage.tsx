
import { Message } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

const FeedbackScore = ({ score }: { score: number }) => {
    const getColor = () => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="flex flex-col items-center">
            <span className={`text-2xl font-bold ${getColor()}`}>{score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
        </div>
    );
};


const RoleplayMessage = ({ msg }: { msg: Message }) => {
    // AI Message
    if (!msg.isUser) {
        return (
            <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {msg.speaker}
                </div>
                <div className="max-w-md p-3 rounded-lg bg-slate-100">
                    <p className="font-cyrillic text-lg" lang="ru">{msg.text}</p>
                    {msg.pronunciation && <p className="text-sm text-slate-500 italic">{msg.pronunciation}</p>}
                </div>
            </div>
        );
    }

    // User Message
    return (
        <div className="flex items-end gap-2 justify-end">
            <div className="max-w-xl w-full p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-slate-600">あなたの発音:</p>
                <p lang="ru" className="text-lg font-medium text-slate-800">{msg.text || "..."}</p>

                <div className="mt-3 pt-3 border-t border-green-200">
                    {msg.isFeedbackLoading && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <LoadingSpinner className="h-4 w-4" />
                            <span>AIがフィードバックを生成中...</span>
                        </div>
                    )}
                    
                    {!msg.isFeedbackLoading && msg.feedback && !msg.feedbackError && (
                        <div>
                             <h4 className="text-sm font-bold text-slate-700 mb-2">AIからのフィードバック</h4>
                             <div className="flex gap-4 items-start bg-white p-3 rounded-md shadow-sm">
                                <div className="flex-shrink-0">
                                    <FeedbackScore score={msg.feedback.score} />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-slate-700">{msg.feedback.text}</p>
                                    <div className="mt-2 text-xs text-slate-500">
                                        <span className="font-semibold">お手本:</span>
                                        <span className="font-cyrillic font-medium ml-1" lang="ru">{msg.correctPhrase}</span>
                                        {msg.correctPronunciation && <span className="italic ml-1">({msg.correctPronunciation})</span>}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    {msg.feedback.is_correct ? 
                                        <CheckCircleIcon className="h-8 w-8 text-green-500" /> :
                                        <XCircleIcon className="h-8 w-8 text-red-500" />
                                    }
                                </div>
                             </div>
                        </div>
                    )}

                    {msg.feedbackError && (
                        <div className="flex gap-3 items-center bg-red-50 p-3 rounded-md text-red-700">
                            <div className="flex-shrink-0">
                                <AlertTriangleIcon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold">{msg.feedbackError}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleplayMessage;