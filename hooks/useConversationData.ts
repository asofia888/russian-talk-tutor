
import { useState, useEffect } from 'react';
import { ConversationLine } from '../types';
import { generateConversation } from '../services/geminiService';

export const useConversationData = (topicId: string | undefined, topicTitle: string) => {
    const [conversation, setConversation] = useState<ConversationLine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (!topicId || !topicTitle) {
            setIsLoading(false);
            setError("トピック情報が見つかりません。");
            return;
        };

        const isCustomTopic = topicId?.startsWith('custom');
        const cacheKey = `conversation-${topicId}`;
        let isComponentMounted = true;

        const loadConversation = async () => {
            // Reset state for new topic
            setError(null);

            // 1. Try to load from cache first for instant UI (skip for custom topics)
            let hasCache = false;
            if (!isCustomTopic) {
                try {
                    const cachedData = localStorage.getItem(cacheKey);
                    if (cachedData) {
                        if (isComponentMounted) {
                            setConversation(JSON.parse(cachedData));
                            setIsLoading(false); // We have data, don't show full-page skeleton
                            hasCache = true;
                        }
                    } else {
                        // No cache, so we are definitely in a full loading state
                        if (isComponentMounted) setIsLoading(true);
                    }
                } catch (cacheError) {
                    console.error("Failed to read from cache:", cacheError);
                    if (isComponentMounted) setIsLoading(true); // Treat corrupted cache as no cache
                }
            } else {
                // For custom topics, always show the full loading spinner
                if(isComponentMounted) setIsLoading(true);
            }


            // 2. Fetch from network to get the latest data or initial data
            try {
                const freshData = await generateConversation(topicTitle);
                if (isComponentMounted) {
                    setConversation(freshData);
                    // Update cache with fresh data (skip for custom topics)
                    if (!isCustomTopic) {
                        try {
                            localStorage.setItem(cacheKey, JSON.stringify(freshData));
                        } catch (e) {
                            console.error("Failed to write to cache", e);
                        }
                    }
                }
            } catch (fetchError) {
                console.error("Failed to fetch conversation:", fetchError);
                // If fetching fails, we only set a critical error if we don't have cached data.
                if (!hasCache) {
                    if (isComponentMounted) {
                        setError('会話の生成に失敗しました。ネットワーク接続を確認するか、後でもう一度お試しください。');
                    }
                } else {
                    // We have cache, so it's a non-critical error
                    if(isComponentMounted){
                        setError('コンテンツの更新に失敗しました。オフライン版のデータを表示しています。');
                    }
                }
            } finally {
                if (isComponentMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadConversation();

        return () => {
            isComponentMounted = false;
        };
    }, [topicId, topicTitle, retryCount]);

    const retry = () => {
        setRetryCount(prev => prev + 1);
        setError(null);
        setIsLoading(true);
    };

    return { conversation, isLoading, error, retry };
};