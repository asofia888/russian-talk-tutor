
import React, { useState, useEffect } from 'react';
import { ConversationLine, Word } from '../types';
import WordChip from './WordChip';
import PlayIcon from './icons/PlayIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import LightbulbIcon from './icons/LightbulbIcon';
import GrammarModal from './GrammarModal';
import CaseDrillModal from './CaseDrillModal';
import { useAudio } from '../contexts/AudioContext';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';

interface ConversationCardProps {
    line: ConversationLine;
    isListeningMode: boolean;
}

const ConversationCard = ({ line, isListeningMode }: ConversationCardProps) => {
    const { speak, isSpeaking, cancel } = useAudio();
    const [isCurrentCardSpeaking, setIsCurrentCardSpeaking] = useState(false);
    const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
    const [drillWord, setDrillWord] = useState<Word | null>(null);
    const [isTranslationVisible, setIsTranslationVisible] = useState(false);

    useEffect(() => {
        if (!isSpeaking) {
            setIsCurrentCardSpeaking(false);
        }
    }, [isSpeaking]);

    useEffect(() => {
        // When the global mode is turned on or off, reset the local visibility state.
        // This ensures that when the user toggles the global switch,
        // all cards revert to their default (hidden) state for that mode.
        setIsTranslationVisible(false);
    }, [isListeningMode]);

    const handlePlay = (text: string) => {
        if (isSpeaking) {
            cancel();
            setIsCurrentCardSpeaking(false);
        } else {
            setIsCurrentCardSpeaking(true);
            speak(text, 'ru-RU', () => setIsCurrentCardSpeaking(false));
        }
    };

    const handleDrillRequest = (word: Word) => {
        if (word.caseInfo) {
            setDrillWord(word);
        }
    };


    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                        {line.speaker}
                    </div>
                    <div className="flex-grow">
                        <p className="text-2xl font-cyrillic font-medium text-slate-800" lang="ru">{line.russian}</p>
                        <p className="text-md text-slate-500 italic">{line.pronunciation}</p>
                        
                        {isListeningMode ? (
                            <div className="mt-1 min-h-[24px]">
                                {isTranslationVisible ? (
                                    <>
                                        <p className="text-md text-slate-600">{line.japanese}</p>
                                        <button onClick={() => setIsTranslationVisible(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 mt-1 flex items-center gap-1">
                                            <EyeOffIcon className="w-3 h-3" />
                                            訳を隠す
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsTranslationVisible(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <EyeIcon className="w-4 h-4" />
                                        訳を表示
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-md text-slate-600 mt-1">{line.japanese}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => handlePlay(line.russian)}
                            className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                            aria-label={`「${line.russian}」を再生`}
                        >
                            {isSpeaking && isCurrentCardSpeaking ? <LoadingSpinner className="h-6 w-6" /> : <PlayIcon className="h-8 w-8" />}
                        </button>
                        {line.grammarPoint && (
                             <button
                                onClick={() => setIsGrammarModalOpen(true)}
                                className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center hover:bg-yellow-200 transition-colors"
                                aria-label="文法解説を見る"
                            >
                                <LightbulbIcon className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">単語</h4>
                    <div className="flex flex-wrap gap-2">
                        {line.words.map((word, index) => (
                            <WordChip key={index} word={word} onDrillRequest={handleDrillRequest} />
                        ))}
                    </div>
                </div>
            </div>
            {isGrammarModalOpen && line.grammarPoint && (
                <GrammarModal 
                    grammarPoint={line.grammarPoint} 
                    onClose={() => setIsGrammarModalOpen(false)} 
                />
            )}
            {drillWord && (
                <CaseDrillModal
                    word={drillWord}
                    onClose={() => setDrillWord(null)}
                />
            )}
        </>
    );
};

export default ConversationCard;