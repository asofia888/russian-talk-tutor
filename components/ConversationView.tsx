
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useConversationData } from '../hooks/useConversationData';
import ConversationCard from './ConversationCard';
import ConversationSkeleton from './ConversationSkeleton';
import ErrorNotification from './ErrorNotification';
import { useLocalStorage } from '../hooks/useLocalStorage';
import EyeIcon from './icons/EyeIcon';

const ConversationView = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const topicTitle = location.state?.topicTitle || '会話';

    const { conversation, isLoading, error, retry } = useConversationData(topicId, topicTitle);
    const [isListeningMode, setIsListeningMode] = useLocalStorage('listeningMode', false);

    const startRoleplay = () => {
        navigate('/roleplay', { state: { conversation, topicTitle } });
    };

    if (isLoading) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6">{topicTitle}</h1>
                <ConversationSkeleton />
            </div>
        );
    }

    if (error && conversation.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-800">{topicTitle}</h1>
                <ErrorNotification 
                    message={error}
                    type="error"
                    onRetry={retry}
                    retryLabel="再生成する"
                    className="max-w-2xl mx-auto"
                />
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        トピック選択に戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">{topicTitle}</h1>
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg justify-center">
                        <EyeIcon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700 select-none">訳を隠す</span>
                        <button
                            onClick={() => setIsListeningMode(!isListeningMode)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isListeningMode ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                            role="switch"
                            aria-checked={isListeningMode}
                            aria-label="リスニングモードを切り替え"
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isListeningMode ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                     {conversation.length > 0 && (
                         <button
                            onClick={startRoleplay}
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-transform duration-300 hover:scale-105"
                        >
                            ロールプレイを開始
                        </button>
                    )}
                </div>
            </div>
             {error && conversation.length > 0 && ( // Show a non-blocking error if we have cached data but failed to refresh
                <ErrorNotification
                    message={error}
                    type="warning"
                    onRetry={retry}
                    retryLabel="更新を再試行"
                    className="mb-4"
                />
            )}
            <div className="space-y-6">
                {conversation.map((line, index) => (
                    <ConversationCard key={index} line={line} isListeningMode={isListeningMode} />
                ))}
            </div>
        </div>
    );
};

export default ConversationView;
