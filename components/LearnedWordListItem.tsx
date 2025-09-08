
import React from 'react';
import { FavoriteWord } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAudio } from '../contexts/AudioContext';
import PlayIcon from './icons/PlayIcon';
import TrashIcon from './icons/TrashIcon';

const formatDate = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reviewDate = new Date(dateString);
    reviewDate.setHours(0, 0, 0, 0);

    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return <span className="font-bold text-blue-600">今日</span>;
    if (diffDays === 1) return <span className="text-slate-600">明日</span>;
    if (diffDays <= 7) return <span className="text-slate-600">{diffDays}日後</span>;
    return <span className="text-slate-500 text-xs">{reviewDate.toLocaleDateString('ja-JP')}</span>;
};

const LearnedWordListItem = ({ word }: { word: FavoriteWord }) => {
    const { removeFavorite } = useFavorites();
    const { speak } = useAudio();

    return (
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm text-slate-800 items-center">
            <div className="col-span-3 font-cyrillic font-medium text-base" lang="ru">{word.russian}</div>
            <div className="col-span-3 text-slate-500 italic">{word.pronunciation}</div>
            <div className="col-span-3">{word.japanese}</div>
            <div className="col-span-2 font-medium">{formatDate(word.nextReviewDate)}</div>
            <div className="col-span-1 flex justify-end items-center gap-1">
                 <button 
                    onClick={() => speak(word.russian, 'ru-RU')} 
                    className="h-8 w-8 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-100 transition-colors"
                    aria-label={`単語「${word.russian}」を再生`}
                >
                    <PlayIcon className="h-5 w-5" />
                </button>
                 <button 
                    onClick={() => removeFavorite(word.russian)} 
                    className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                    aria-label={`単語「${word.russian}」を削除`}
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default LearnedWordListItem;