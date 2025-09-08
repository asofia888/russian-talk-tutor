
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import TopicSelection from './components/TopicSelection';
import ConversationView from './components/ConversationView';
import FavoritesView from './components/FavoritesView';
import RoleplayView from './components/RoleplayView';
import LegalView from './components/LegalView';
import NotFoundView from './components/NotFoundView';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AudioProvider } from './contexts/AudioContext';
import SettingsModal from './components/SettingsModal';

function App() {
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    return (
        <FavoritesProvider>
            <AudioProvider>
                <HashRouter>
                    <div className="min-h-screen flex flex-col">
                        <Header onOpenSettings={() => setIsSettingsModalOpen(true)} />
                        <main className="flex-grow container mx-auto p-4 md:p-6">
                            <Routes>
                                <Route path="/" element={<TopicSelection />} />
                                <Route path="/conversation/:topicId" element={<ConversationView />} />
                                <Route path="/favorites" element={<FavoritesView />} />
                                <Route path="/roleplay" element={<RoleplayView />} />
                                <Route path="/legal" element={<LegalView />} />
                                <Route path="*" element={<NotFoundView />} />
                            </Routes>
                        </main>
                        <footer className="text-center p-4 text-slate-500 text-sm">
                            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-2">
                                <Link to="/legal" className="hover:underline hover:text-slate-700 transition-colors">プライバシーポリシー</Link>
                                <Link to="/legal" className="hover:underline hover:text-slate-700 transition-colors">免責事項</Link>
                            </div>
                            <p>© 2024 Russian Talk Tutor. All rights reserved.</p>
                        </footer>
                    </div>
                    <SettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                    />
                    {!isOnline && (
                        <div className="fixed bottom-4 right-4 bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
                            オフラインモード
                        </div>
                    )}
                </HashRouter>
            </AudioProvider>
        </FavoritesProvider>
    );
}

export default App;