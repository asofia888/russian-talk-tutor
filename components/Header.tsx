import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import BookOpenIcon from './icons/BookOpenIcon';
import SettingsIcon from './icons/SettingsIcon';

const Header = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
    const { reviewQueueCount } = useFavorites();

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo.svg" alt="Russian Talk Tutor Logo" className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-2xl font-bold text-slate-800 hidden sm:block group-hover:text-blue-600 transition-colors">
                        Russian Talk Tutor
                    </span>
                </Link>
                <nav className="flex items-center gap-2">
                    <NavLink 
                        to="/favorites" 
                        className={({ isActive }) => 
                            `relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`
                        }
                    >
                        <BookOpenIcon className="h-5 w-5" />
                        <span>単語帳</span>
                        {reviewQueueCount > 0 && (
                             <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-slate-800 animate-pulse">
                                {reviewQueueCount}
                            </span>
                        )}
                    </NavLink>
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        aria-label="音声設定を開く"
                    >
                        <SettingsIcon className="h-6 w-6" />
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;