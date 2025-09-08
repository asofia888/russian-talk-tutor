
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOPIC_CATEGORIES } from '../constants';
import { ConversationTopic, CustomTopicHistoryItem } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import { useLocalStorage } from '../hooks/useLocalStorage';
import TrashIcon from './icons/TrashIcon';

const TopicCard = ({ topic }: { topic: ConversationTopic }) => {
    const navigate = useNavigate();
    const cacheKey = `conversation-${topic.id}`;
    const isCached = localStorage.getItem(cacheKey) !== null;

    const getLevelColor = (level: ConversationTopic['level']) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <button
            onClick={() => navigate(`/conversation/${topic.id}`, { state: { topicTitle: topic.title } })}
            className="w-full bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between"
            aria-label={`トピック「${topic.title}」を開始`}
        >
            <div>
                 <div className="flex justify-between items-start">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getLevelColor(topic.level)}`}>
                        {topic.level}
                    </span>
                    {isCached && <span className="text-slate-400 text-xl" title="オフラインで利用可能">☁️</span>}
                </div>
                <h3 className="text-xl font-bold mt-3 text-slate-800">{topic.title}</h3>
                <p className="text-slate-600 mt-1">{topic.description}</p>
            </div>
        </button>
    );
};

const CustomTopicGenerator = ({ onGenerate }: { onGenerate: (topic: string) => void }) => {
    const [customTopic, setCustomTopic] = useState('');

    const handleCustomTopicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const topicTitle = customTopic.trim();
        if (topicTitle) {
            onGenerate(topicTitle);
            setCustomTopic(''); // Clear input after submission
        }
    };

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-500 pl-4 text-slate-700">カスタムトピックを生成</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-slate-600 mb-4">練習したい会話のテーマを自由に入力してください。（例：空港での乗り継ぎ、好きな映画について話す）</p>
                <form onSubmit={handleCustomTopicSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="会話のテーマを入力..."
                        className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        aria-label="カスタム会話テーマ"
                    />
                    <button
                        type="submit"
                        disabled={!customTopic.trim()}
                        className="flex-shrink-0 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        <span>会話を生成</span>
                    </button>
                </form>
            </div>
        </section>
    );
}

const CustomTopicHistory = ({ 
    history, 
    onNavigate,
    onDelete,
    onClearAll 
}: { 
    history: CustomTopicHistoryItem[];
    onNavigate: (item: CustomTopicHistoryItem) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
}) => {
    if (history.length === 0) {
        return null;
    }

    return (
        <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold border-l-4 border-teal-500 pl-4 text-slate-700">カスタムトピックの履歴</h2>
                <button
                    onClick={onClearAll}
                    className="text-sm font-semibold text-slate-500 hover:text-red-600 hover:underline transition-colors"
                >
                    すべて削除
                </button>
            </div>
            <div className="space-y-3">
                {history.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                作成日時: {new Date(item.createdAt).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <button
                                onClick={() => onNavigate(item)}
                                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                                開始
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-slate-400 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"
                                aria-label={`履歴「${item.title}」を削除`}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};


const TopicSelection = () => {
    const navigate = useNavigate();
    const [customTopicHistory, setCustomTopicHistory] = useLocalStorage<CustomTopicHistoryItem[]>('customTopicHistory', []);

    const handleGenerateCustomTopic = (topicTitle: string) => {
        const newId = `custom-${Date.now()}`;
        const newHistoryItem: CustomTopicHistoryItem = {
            id: newId,
            title: topicTitle,
            createdAt: new Date().toISOString()
        };
        setCustomTopicHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
        navigate(`/conversation/${newId}`, { state: { topicTitle } });
    };

    const handleNavigateHistory = (item: CustomTopicHistoryItem) => {
        navigate(`/conversation/${item.id}`, { state: { topicTitle: item.title } });
    };

    const handleDeleteHistoryItem = (id: string) => {
        setCustomTopicHistory(prev => prev.filter(item => item.id !== id));
    };

    const handleClearAllHistory = () => {
        if (window.confirm('本当にすべてのカスタムトピック履歴を削除しますか？')) {
            setCustomTopicHistory([]);
        }
    };


    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900">会話トピックを選ぼう</h1>
                <p className="mt-2 text-lg text-slate-600">3000語の習得を目指して、興味のあるトピックでロシア語の会話練習を始めましょう。</p>
            </div>

            <CustomTopicGenerator onGenerate={handleGenerateCustomTopic} />

            <CustomTopicHistory
                history={customTopicHistory}
                onNavigate={handleNavigateHistory}
                onDelete={handleDeleteHistoryItem}
                onClearAll={handleClearAllHistory}
            />

            {TOPIC_CATEGORIES.map(category => (
                <section key={category.name}>
                    <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-slate-700">{category.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.topics.map(topic => (
                            <TopicCard key={topic.id} topic={topic} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default TopicSelection;