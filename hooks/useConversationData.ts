
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
        const cacheTimestampKey = `conversation-timestamp-${topicId}`;
        const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        let isComponentMounted = true;

        const loadConversation = async () => {
            // Reset state for new topic
            setError(null);

            // 1. Try to load from cache first for instant UI
            let hasCache = false;
            let isCacheExpired = false;

            try {
                const cachedData = localStorage.getItem(cacheKey);
                const cachedTimestamp = localStorage.getItem(cacheTimestampKey);

                if (cachedData) {
                    // Check if cache has expired (only for custom topics)
                    if (isCustomTopic && cachedTimestamp) {
                        const cacheAge = Date.now() - parseInt(cachedTimestamp, 10);
                        isCacheExpired = cacheAge > CACHE_EXPIRY_MS;

                        if (isCacheExpired) {
                            console.log(`Cache expired for custom topic: ${topicId}`);
                        }
                    }

                    // Use cache if it's not expired (or if it's not a custom topic)
                    if (!isCacheExpired) {
                        if (isComponentMounted) {
                            setConversation(JSON.parse(cachedData));
                            setIsLoading(false); // We have data, don't show full-page skeleton
                            hasCache = true;
                        }
                    } else {
                        // Cache expired, show loading state
                        if (isComponentMounted) setIsLoading(true);
                    }
                } else {
                    // No cache, so we are definitely in a full loading state
                    if (isComponentMounted) setIsLoading(true);
                }
            } catch (cacheError) {
                console.error("Failed to read from cache:", cacheError);
                if (isComponentMounted) setIsLoading(true); // Treat corrupted cache as no cache
            }


            // 2. Fetch from network to get the latest data or initial data
            try {
                // Use topicId for predefined topics (e.g., "b-greetings"), topicTitle for custom topics
                const topicIdentifier = isCustomTopic ? topicTitle : topicId;
                const freshData = await generateConversation(topicIdentifier);
                if (isComponentMounted) {
                    setConversation(freshData);
                    // Update cache with fresh data (including custom topics with timestamp)
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify(freshData));
                        // Save timestamp for custom topics to track cache expiry
                        if (isCustomTopic) {
                            localStorage.setItem(cacheTimestampKey, Date.now().toString());
                        }
                    } catch (e) {
                        console.error("Failed to write to cache", e);
                        // Handle quota exceeded or other storage errors gracefully
                        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                            console.warn("localStorage quota exceeded. Consider clearing old cache.");
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