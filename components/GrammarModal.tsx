
import React from 'react';
import { GrammarPoint } from '../types';
import { useAudio } from '../contexts/AudioContext';
import PlayIcon from './icons/PlayIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface GrammarModalProps {
    grammarPoint: GrammarPoint;
    onClose: () => void;
}

const GrammarModal = ({ grammarPoint, onClose }: GrammarModalProps) => {
    const { speak, isSpeaking, cancel } = useAudio();
    const [speakingSentence, setSpeakingSentence] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isSpeaking) {
            setSpeakingSentence(null);
        }
    }, [isSpeaking]);

    const handlePlay = (sentence: string) => {
        if (isSpeaking && speakingSentence === sentence) {
            cancel();
        } else {
            setSpeakingSentence(sentence);
            speak(sentence, 'ru-RU');
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-blue-700">{grammarPoint.title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="閉じる">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">解説</h3>
                    <p className="text-slate-600 leading-relaxed">{grammarPoint.explanation}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">例文</h3>
                    <div className="space-y-3">
                        {grammarPoint.examples.map((example, index) => (
                            <div key={index} className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                                <div className="flex-grow">
                                    <p className="font-cyrillic text-lg text-slate-800" lang="ru">{example.russian}</p>
                                    <p className="text-sm text-slate-500 italic">{example.pronunciation}</p>
                                    <p className="text-sm text-slate-600">{example.japanese}</p>
                                </div>
                                <button
                                    onClick={() => handlePlay(example.russian)}
                                    className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                    aria-label={`例文「${example.russian}」を再生`}
                                >
                                    {isSpeaking && speakingSentence === example.russian ? <LoadingSpinner className="h-5 w-5" /> : <PlayIcon className="h-6 w-6" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default GrammarModal;