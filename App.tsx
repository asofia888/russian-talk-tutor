
import { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import TopicSelection from './components/TopicSelection';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import LoadingSpinner from './components/LoadingSpinner';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AudioProvider } from './contexts/AudioContext';

// Lazy load heavy components
const ConversationView = lazy(() => import('./components/ConversationView'));
const FavoritesView = lazy(() => import('./components/FavoritesView'));
const RoleplayView = lazy(() => import('./components/RoleplayView'));
const LegalView = lazy(() => import('./components/LegalView'));
const NotFoundView = lazy(() => import('./components/NotFoundView'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));

function App() {
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);


    return (
        <ErrorBoundary>
            <FavoritesProvider>
                <AudioProvider>
                    <HashRouter>
                        <NetworkStatusBanner />
                        <div className="min-h-screen flex flex-col">
                            <Header onOpenSettings={() => setIsSettingsModalOpen(true)} />
                            <main className="flex-grow container mx-auto p-4 md:p-6">
                                <ErrorBoundary>
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <Routes>
                                            <Route path="/" element={<TopicSelection />} />
                                            <Route path="/conversation/:topicId" element={<ConversationView />} />
                                            <Route path="/favorites" element={<FavoritesView />} />
                                            <Route path="/roleplay" element={<RoleplayView />} />
                                            <Route path="/legal" element={<LegalView />} />
                                            <Route path="*" element={<NotFoundView />} />
                                        </Routes>
                                    </Suspense>
                                </ErrorBoundary>
                            </main>
                            <footer className="text-center p-4 text-slate-500 text-sm">
                                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-2">
                                    <Link to="/legal" className="hover:underline hover:text-slate-700 transition-colors">プライバシーポリシー</Link>
                                    <Link to="/legal" className="hover:underline hover:text-slate-700 transition-colors">免責事項</Link>
                                </div>
                                <p>© 2024 Russian Talk Tutor. All rights reserved.</p>
                            </footer>
                        </div>
                        {isSettingsModalOpen && (
                            <Suspense fallback={null}>
                                <SettingsModal
                                    isOpen={isSettingsModalOpen}
                                    onClose={() => setIsSettingsModalOpen(false)}
                                />
                            </Suspense>
                        )}
                    </HashRouter>
                </AudioProvider>
            </FavoritesProvider>
        </ErrorBoundary>
    );
}

export default App;