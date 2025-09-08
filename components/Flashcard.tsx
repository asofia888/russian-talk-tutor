
import React, { useState } from 'react';
import { FavoriteWord } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAudio } from '../contexts/AudioContext';
import PlayIcon from './icons/PlayIcon';

const Flashcard = ({ word }: { word: FavoriteWord }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const { updateFavorite } = useFavorites();
    const { speak } = useAudio();

    const handleReview = (performance: 'again' | 'good' | 'easy') => {
        updateFavorite(word.russian, performance);
        setIsRevealed(false); // Reset for the next card that will appear
    };
    
    if (!isRevealed) {
        return (
            <div className="relative group bg-white rounded-xl p-6 flex flex-col justify-between aspect-[16/10] transition-all duration-300">
                 <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-slate-500 mb-2">この単語の意味は？</p>
                    <p className="font-cyrillic text-5xl font-bold text-slate-800" lang="ru">{word.russian}</p>
                </div>
                 <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setIsRevealed(true)}
                        className="flex-grow w-full py-3 px-4 rounded-md text-base font-semibold transition-colors bg-blue-500 text-white hover:bg-blue-600"
                    >
                        答えを見る
                    </button>
                    <button 
                        onClick={() => speak(word.russian, 'ru-RU')} 
                        className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                        aria-label="再生"
                    >
                        <PlayIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }

    return (
         <div className="relative group bg-white rounded-xl p-6 flex flex-col justify-between aspect-[16/10] transition-all duration-300 animate-fade-in">
             <div className="flex-grow flex flex-col items-center justify-center text-center">
                <p className="font-cyrillic text-5xl font-bold text-slate-800 mb-2" lang="ru">{word.russian}</p>
                <p className="text-xl text-slate-500 italic">{word.pronunciation}</p>
                <p className="text-2xl text-slate-700 font-medium mt-1">{word.japanese}</p>
            </div>
             <div className="mt-4">
                <p className="text-center text-sm text-slate-500 mb-3">この単語の記憶度は？</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => handleReview('again')}
                        className="flex-grow w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                    >
                        もう一度
                    </button>
                    <button
                        onClick={() => handleReview('good')}
                        className="flex-grow w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    >
                        普通
                    </button>
                    <button
                        onClick={() => handleReview('easy')}
                        className="flex-grow w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                    >
                        簡単
                    </button>
                </div>
             </div>
              <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default Flashcard;