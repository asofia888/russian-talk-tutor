
import { ConversationLine } from '../types';
import MicIcon from './icons/MicIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface RoleplayControlsProps {
    status: 'playing' | 'ended';
    isUserTurn: boolean;
    userHasCompletedTurn: boolean;
    isSpeaking: boolean;
    currentLine: ConversationLine | null;
    isMicSupported: boolean;
    isListening: boolean;
    transcript: string;
    onStartListening: () => void;
    onStopListening: () => void;
    onProceed: () => void;
}

const RoleplayControls = ({
    status,
    isUserTurn,
    userHasCompletedTurn,
    isSpeaking,
    currentLine,
    isMicSupported,
    isListening,
    transcript,
    onStartListening,
    onStopListening,
    onProceed
}: RoleplayControlsProps) => {

    const renderUserTurnContent = () => {
        if (userHasCompletedTurn) {
            return (
                <div className="text-center w-full max-w-md">
                    <p className="mb-4 font-semibold text-slate-600">フィードバックを確認したら、次に進んでください。</p>
                    <button
                        onClick={onProceed}
                        className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-transform duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                        aria-label="次のセリフへ進む"
                    >
                        <span>次へ</span>
                        <ArrowRightIcon className="h-5 w-5" />
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center w-full">
                <p className="mb-2 font-semibold">あなたの番です。下のセリフを読んでください:</p>
                {currentLine && (
                    <div className="mb-4 text-center p-3 bg-yellow-100 border border-yellow-200 rounded-md">
                        <p className="font-cyrillic text-xl" lang="ru">{currentLine.russian}</p>
                        <p className="text-md text-slate-600 italic">{currentLine.pronunciation}</p>
                    </div>
                )}
                {!isMicSupported ? (
                        <p className="text-red-500">ご使用のブラウザは音声認識に対応していません。</p>
                ): (
                    <button
                        onClick={isListening ? onStopListening : onStartListening}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
                        aria-label={isListening ? "録音停止" : "録音開始"}
                    >
                        <MicIcon className="h-10 w-10 text-white" />
                    </button>
                )}
                    {isListening && <p className="mt-2 text-sm text-slate-500 font-semibold">録音中...</p>}
                    {transcript && !isListening && <p className="mt-2 text-sm text-slate-600">認識結果: {transcript}</p>}
            </div>
        );
    };

    return (
        <footer className="p-4 border-t min-h-[180px] flex items-center justify-center bg-slate-50">
            {status === 'ended' && (
                <div className="text-center text-slate-500">
                    <p className="text-xl font-bold">🎉</p>
                    <p className="font-semibold">ロールプレイ終了！お疲れ様でした。</p>
                </div>
            )}
            {status === 'playing' && (
                isUserTurn 
                ? renderUserTurnContent() 
                : <div className="text-center text-slate-500">{isSpeaking ? 'AIが話しています...' : 'AIの応答を待っています...'}</div>
            )}
        </footer>
    );
};

export default RoleplayControls;