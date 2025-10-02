import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [rate, setRate] = useState(1);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSupported(true);
            const handleVoicesChanged = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
                // Set default Russian voice
                const russianVoice = availableVoices.find(voice => voice.lang.startsWith('ru'));
                setSelectedVoice(russianVoice || availableVoices[0] || null);
            };
            window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
            handleVoicesChanged(); // initial call
            return () => {
                window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
                window.speechSynthesis.cancel();
            };
        }
        return undefined;
    }, []);

    const speak = useCallback((text: string, lang: string, onEnd?: () => void) => {
        if (!isSupported) {
            alert('ご使用のブラウザは音声読み上げに対応していません。');
            onEnd?.();
            return;
        }
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);

        // Find the best available voice for the requested language.
        // 1. Prefer the user's selected voice if it matches the language.
        // 2. Otherwise, search for any other voice that matches the language.
        // 3. If no matching voice is found, do not set `utterance.voice` and let the browser choose based on `utterance.lang`.
        let voiceToUse: SpeechSynthesisVoice | null = null;
        const langPrefixParts = lang.split('-');
        const langPrefix = langPrefixParts[0];
        if (!langPrefix) {
            return;
        }

        if (selectedVoice && selectedVoice.lang.startsWith(langPrefix)) {
            voiceToUse = selectedVoice;
        } else {
            const matchingVoices = voices.filter(v => v.lang.startsWith(langPrefix));
            // Prefer a default voice if available
            voiceToUse = matchingVoices.find(v => v.default) || matchingVoices[0] || null;
        }

        if (voiceToUse) {
            utterance.voice = voiceToUse;
        }
        
        utterance.lang = lang;
        utterance.rate = rate;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
        };
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            console.error("SpeechSynthesis Error:", e.error);
            setIsSpeaking(false);
            onEnd?.();
        };
        
        window.speechSynthesis.speak(utterance);
    }, [isSupported, voices, selectedVoice, rate]);

    const cancel = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    return { isSupported, isSpeaking, voices, selectedVoice, setSelectedVoice, rate, setRate, speak, cancel };
};