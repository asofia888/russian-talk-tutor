
import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConversationLine } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudio } from '../contexts/AudioContext';
import { useRoleplay } from '../hooks/useRoleplay';
import RoleplayMessage from './RoleplayMessage';
import RoleplayControls from './RoleplayControls';
import RoleSelectionModal from './RoleSelectionModal';
import ErrorNotification from './ErrorNotification';


const RoleplayView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { conversation, topicTitle } = (location.state || {}) as { conversation: ConversationLine[], topicTitle: string };
    
    const { 
        status, 
        userRole, 
        messages, 
        currentLineIndex, 
        selectRole, 
        addAiMessage,
        addUserMessage,
        endRoleplay,
        proceedToNextLine
    } = useRoleplay();

    const { isSupported, isListening, transcript, error: speechError, startListening, stopListening, resetTranscript, clearError } = useSpeechRecognition();
    const { speak, isSpeaking, cancel } = useAudio();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Effect to redirect if conversation data is missing
    useEffect(() => {
        if (!conversation) {
            navigate('/');
        }
    }, [conversation, navigate]);
    
    // Effect to scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Main conversation flow logic
    useEffect(() => {
        if (status !== 'playing' || isSpeaking || !conversation) {
            return;
        }

        const currentLine = conversation[currentLineIndex];
        if (!currentLine) {
            endRoleplay();
            return;
        }

        // AI's turn
        if (currentLine.speaker !== userRole) {
            speak(currentLine.russian, 'ru-RU', () => {
                addAiMessage(currentLine);
            });
        }
        // User's turn is handled by user interaction via RoleplayControls
    }, [status, currentLineIndex, userRole, conversation, speak, isSpeaking, addAiMessage, endRoleplay]);

    // Handle submission of user's speech
    const handleUserSpeechSubmit = useCallback(() => {
        const currentLine = conversation?.[currentLineIndex];
        if (!transcript || status !== 'playing' || !currentLine || currentLine.speaker !== userRole) {
            return;
        }
        addUserMessage(transcript, currentLine);
        resetTranscript();
    }, [currentLineIndex, conversation, transcript, userRole, status, resetTranscript, addUserMessage]);

    // Auto-submit when listening stops
    useEffect(() => {
        if (!isListening && transcript) {
            handleUserSpeechSubmit();
        }
    }, [isListening, transcript, handleUserSpeechSubmit]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancel();
            if (isListening) {
                stopListening();
            }
        };
    }, [cancel, stopListening, isListening]);


    if (!conversation) return null;
    if (status === 'selecting_role') {
        const speakers = [...new Set(conversation.map(line => line.speaker))];
        return <RoleSelectionModal speakers={speakers} onSelect={selectRole} />;
    }

    const currentLine = status === 'playing' ? conversation[currentLineIndex] : null;
    const isUserTurn = status === 'playing' && !!currentLine && currentLine.speaker === userRole;

    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    // Check if the last message corresponds to the current turn for the user
    const userHasCompletedTurn = isUserTurn && lastMessage?.isUser && lastMessage.correctPhrase === currentLine.russian;


    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-xl">
            <header className="p-4 border-b flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{topicTitle} - ロールプレイ</h1>
                    <p className="text-sm text-slate-500">あなたは「{userRole}」さんです。</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition text-sm font-semibold"
                    aria-label="ロールプレイを終了してトピック選択に戻る"
                >
                    終了する
                </button>
            </header>

            <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50/50">
                {speechError && (
                    <ErrorNotification
                        message={speechError}
                        type="error"
                        onDismiss={clearError}
                        onRetry={startListening}
                        retryLabel="音声認識を再開"
                    />
                )}
                {messages.map((msg) => (
                    <RoleplayMessage key={msg.id} msg={msg} />
                ))}
                <div ref={chatEndRef} />
            </div>
            
            <RoleplayControls
                status={status}
                isUserTurn={isUserTurn}
                userHasCompletedTurn={userHasCompletedTurn}
                isSpeaking={isSpeaking}
                currentLine={currentLine}
                isMicSupported={isSupported}
                isListening={isListening}
                transcript={transcript}
                onStartListening={startListening}
                onStopListening={stopListening}
                onProceed={proceedToNextLine}
            />
        </div>
    );
};

export default RoleplayView;