
import React, { useState } from 'react';
import { Word } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAudio } from '../contexts/AudioContext';
import PlayIcon from './icons/PlayIcon';
import StarIcon from './icons/StarIcon';
import StarFilledIcon from './icons/StarFilledIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import TableCellsIcon from './icons/TableCellsIcon';

interface WordChipProps {
    word: Word;
    onDrillRequest: (word: Word) => void;
}

const WordChip = ({ word, onDrillRequest }: WordChipProps) => {
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const { speak, isSpeaking, cancel } = useAudio();
    const [isThisWordSpeaking, setIsThisWordSpeaking] = useState(false);
    
    const isWordFavorite = isFavorite(word.russian);
    const hasCaseInfo = !!word.caseInfo;

    const toggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWordFavorite) {
            removeFavorite(word.russian);
        } else {
            addFavorite(word);
        }
    };

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSpeaking) {
            cancel();
            setIsThisWordSpeaking(false);
        } else {
            setIsThisWordSpeaking(true);
            speak(word.russian, 'ru-RU');
        }
    };
    
    React.useEffect(() => {
        if (!isSpeaking) {
            setIsThisWordSpeaking(false);
        }
    }, [isSpeaking]);

    const handleChipClick = () => {
        if (hasCaseInfo) {
            onDrillRequest(word);
        }
    };

    const ChipWrapper = hasCaseInfo ? 'button' : 'div';

    return (
        <ChipWrapper 
            className={`group relative bg-slate-100 p-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-slate-200 ${hasCaseInfo ? 'cursor-pointer' : ''}`}
            onClick={handleChipClick}
        >
            <div>
                <div className="flex items-center gap-1.5">
                    <p className="font-cyrillic font-medium text-slate-900" lang="ru">{word.russian}</p>
                    {hasCaseInfo && <TableCellsIcon className="h-4 w-4 text-blue-500" />}
                </div>
                <p className="text-xs text-slate-500 italic">{word.pronunciation}</p>
                <p className="text-xs text-slate-600">{word.japanese}</p>
            </div>
            <div className="flex items-center gap-1 ml-auto">
                 <button 
                    onClick={handlePlay} 
                    className="h-8 w-8 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-100 transition-colors"
                    aria-label={`単語「${word.russian}」を再生`}
                >
                    {isSpeaking && isThisWordSpeaking ? <LoadingSpinner className="h-5 w-5"/> : <PlayIcon className="h-5 w-5" />}
                </button>
                <button 
                    onClick={toggleFavorite}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors"
                    aria-label={`単語「${word.russian}」をお気に入り${isWordFavorite ? 'から削除' : 'に追加'}`}
                >
                    {isWordFavorite ? <StarFilledIcon className="h-5 w-5" /> : <StarIcon className="h-5 w-5" />}
                </button>
            </div>
        </ChipWrapper>
    );
};

export default WordChip;