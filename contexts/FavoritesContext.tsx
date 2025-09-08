
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Word, FavoriteWord } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

type PerformanceRating = 'again' | 'good' | 'easy';

interface FavoritesContextType {
    favorites: FavoriteWord[];
    reviewQueueCount: number;
    addFavorite: (word: Word) => void;
    removeFavorite: (russian: string) => void;
    updateFavorite: (russian: string, performance: PerformanceRating) => void;
    isFavorite: (russian: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useLocalStorage<FavoriteWord[]>('favoriteWords-v2-russian', []);

    const reviewQueueCount = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return favorites.filter(f => new Date(f.nextReviewDate) <= today).length;
    }, [favorites]);

    const addFavorite = (word: Word) => {
        if (favorites.some(fav => fav.russian === word.russian)) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newFavorite: FavoriteWord = {
            ...word,
            repetition: 0,
            interval: 0,
            easeFactor: 2.5,
            nextReviewDate: today.toISOString(),
        };
        setFavorites(prev => [...prev, newFavorite].sort((a,b) => a.russian.localeCompare(b.russian, 'ru')));
    };

    const removeFavorite = (russian: string) => {
        setFavorites(prev => prev.filter(fav => fav.russian !== russian));
    };

    const isFavorite = (russian: string) => {
        return favorites.some(fav => fav.russian === russian);
    };

    const updateFavorite = (russian: string, performance: PerformanceRating) => {
        const word = favorites.find(f => f.russian === russian);
        if (!word) return;

        let { repetition, interval, easeFactor } = word;

        if (performance === 'again') {
            repetition = 0;
            interval = 1; 
        } else {
            repetition += 1;
            if (repetition === 1) {
                interval = 1;
            } else if (repetition === 2) {
                interval = 6;
            } else {
                interval = Math.ceil(interval * easeFactor);
            }

            if (performance === 'easy') {
                easeFactor += 0.15;
            }
        }
        
        const newNextReviewDate = new Date();
        newNextReviewDate.setDate(newNextReviewDate.getDate() + interval);
        newNextReviewDate.setHours(0, 0, 0, 0);

        const updatedWord: FavoriteWord = {
            ...word,
            repetition,
            interval,
            easeFactor,
            nextReviewDate: newNextReviewDate.toISOString(),
        };

        setFavorites(prev => prev.map(f => (f.russian === russian ? updatedWord : f)));
    };


    return (
        <FavoritesContext.Provider value={{ favorites, reviewQueueCount, addFavorite, removeFavorite, isFavorite, updateFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};