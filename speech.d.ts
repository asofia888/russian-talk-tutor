// Type definitions for the Web Speech API to fix TypeScript errors.
// These interfaces are not part of the standard DOM library.

// This makes the file a module, preventing it from polluting the global scope
// unless explicitly imported, while still allowing for global augmentation.
export {};

declare global {
    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    interface SpeechRecognitionErrorEvent extends Event {
      readonly error: string;
      readonly message: string;
    }

    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: (event: SpeechRecognitionEvent) => void;
        onstart: () => void;
        onend: () => void;
        onerror: (event: SpeechRecognitionErrorEvent) => void;
        start(): void;
        stop(): void;
    }

    interface SpeechRecognitionStatic {
        new (): SpeechRecognition;
    }

    // New types for SpeechSynthesis
    interface SpeechSynthesisEvent extends Event {
        readonly charIndex: number;
        readonly elapsedTime: number;
        readonly name: string;
    }

    interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
      // FIX: Changed type from `string` to `SpeechSynthesisErrorCode` to match built-in DOM types and resolve conflict.
      readonly error: SpeechSynthesisErrorCode;
    }

    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}