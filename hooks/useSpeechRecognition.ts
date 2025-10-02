import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API types are now in speech.d.ts

interface SpeechRecognitionHook {
    isSupported: boolean;
    isListening: boolean;
    transcript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    clearError: () => void;
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isSupported] = useState(!!SpeechRecognitionAPI);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!isSupported) return;

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.lang = 'ru-RU'; // Set to Russian
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                if (result && result.isFinal) {
                    const transcript = result[0];
                    if (transcript) {
                        finalTranscript += transcript.transcript;
                    }
                }
            }
            if (finalTranscript) {
                 setTranscript(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
            }
        };

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            
            let errorMessage = '';
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = 'マイクの使用が許可されていません。ブラウザの設定でマイクのアクセスを許可してください。';
                    break;
                case 'no-speech':
                    errorMessage = '音声が検出されませんでした。もう一度お試しください。';
                    break;
                case 'audio-capture':
                    errorMessage = 'マイクにアクセスできません。他のアプリケーションがマイクを使用していないか確認してください。';
                    break;
                case 'network':
                    errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
                    break;
                case 'service-not-allowed':
                    errorMessage = '音声認識サービスが利用できません。';
                    break;
                default:
                    errorMessage = '音声認識中にエラーが発生しました。もう一度お試しください。';
            }
            setError(errorMessage);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null); // Clear previous errors
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('Failed to start speech recognition:', err);
                setError('音声認識を開始できませんでした。しばらく時間をおいてから再度お試しください。');
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                console.error('Failed to stop speech recognition:', err);
                setIsListening(false); // Force update state
            }
        }
    }, [isListening]);
    
    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return { isSupported, isListening, transcript, error, startListening, stopListening, resetTranscript, clearError };
};