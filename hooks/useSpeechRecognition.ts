import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API types are now in speech.d.ts

interface SpeechRecognitionHook {
    isSupported: boolean;
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isSupported, setIsSupported] = useState(!!SpeechRecognitionAPI);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
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
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
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
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);
    
    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return { isSupported, isListening, transcript, startListening, stopListening, resetTranscript };
};