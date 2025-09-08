
import React, { createContext, useContext, ReactNode } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface AudioContextType {
    isSupported: boolean;
    isSpeaking: boolean;
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
    rate: number;
    setRate: (rate: number) => void;
    speak: (text: string, lang: string, onEnd?: () => void) => void;
    cancel: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const tts = useTextToSpeech();
    return <AudioContext.Provider value={tts}>{children}</AudioContext.Provider>;
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
