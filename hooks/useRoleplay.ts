
import { useReducer, useCallback } from 'react';
import { ConversationLine, Message, Feedback } from '../types';
import { getPronunciationFeedback } from '../services/geminiService';

// --- State and Reducer ---

export interface RoleplayState {
    status: 'selecting_role' | 'playing' | 'ended';
    userRole: string | null;
    messages: Message[];
    currentLineIndex: number;
}

type RoleplayAction =
    | { type: 'SELECT_ROLE'; payload: { role: string } }
    | { type: 'ADD_AI_MESSAGE'; payload: { line: ConversationLine } }
    | { type: 'ADD_USER_MESSAGE_PENDING'; payload: { id: string, transcript: string; line: ConversationLine } }
    | { type: 'UPDATE_USER_MESSAGE_FEEDBACK'; payload: { id: string; feedback: Feedback } }
    | { type: 'UPDATE_USER_MESSAGE_ERROR'; payload: { id: string; error: string } }
    | { type: 'END_ROLEPLAY' }
    | { type: 'PROCEED_TO_NEXT_LINE' };

const initialState: RoleplayState = {
    status: 'selecting_role',
    userRole: null,
    messages: [],
    currentLineIndex: 0,
};

const createId = () => `msg_${Date.now()}_${Math.random()}`;

const roleplayReducer = (state: RoleplayState, action: RoleplayAction): RoleplayState => {
    switch (action.type) {
        case 'SELECT_ROLE':
            return {
                ...state,
                status: 'playing',
                userRole: action.payload.role,
                messages: [],
                currentLineIndex: 0,
            };
        case 'ADD_AI_MESSAGE': {
            const aiMessage: Message = {
                id: createId(),
                speaker: action.payload.line.speaker,
                text: action.payload.line.russian,
                pronunciation: action.payload.line.pronunciation,
                isUser: false,
            };
            return {
                ...state,
                messages: [...state.messages, aiMessage],
                currentLineIndex: state.currentLineIndex + 1,
            };
        }
        case 'ADD_USER_MESSAGE_PENDING': {
            const { id, transcript, line } = action.payload;
            const userMessage: Message = {
                id,
                speaker: state.userRole!,
                text: transcript,
                isUser: true,
                correctPhrase: line.russian,
                correctPronunciation: line.pronunciation,
                isFeedbackLoading: true,
            };
            return {
                ...state,
                messages: [...state.messages, userMessage],
            };
        }
        case 'UPDATE_USER_MESSAGE_FEEDBACK': {
             const { id, feedback } = action.payload;
             return {
                 ...state,
                 messages: state.messages.map(msg => 
                    msg.id === id 
                        ? { ...msg, feedback, isFeedbackLoading: false } 
                        : msg
                 )
             };
        }
        case 'UPDATE_USER_MESSAGE_ERROR': {
            const { id, error } = action.payload;
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === id
                        ? { ...msg, feedbackError: error, isFeedbackLoading: false }
                        : msg
                )
            };
        }
        case 'PROCEED_TO_NEXT_LINE':
            return {
                ...state,
                currentLineIndex: state.currentLineIndex + 1,
            };
        case 'END_ROLEPLAY':
            return { ...state, status: 'ended' };
        default:
            return state;
    }
};

// --- Custom Hook ---

export const useRoleplay = () => {
    const [state, dispatch] = useReducer(roleplayReducer, initialState);

    const selectRole = useCallback((role: string) => {
        dispatch({ type: 'SELECT_ROLE', payload: { role } });
    }, []);

    const addAiMessage = useCallback((line: ConversationLine) => {
        dispatch({ type: 'ADD_AI_MESSAGE', payload: { line } });
    }, []);

    const addUserMessage = useCallback(async (transcript: string, line: ConversationLine) => {
        if (!transcript) return;
        
        const messageId = createId();
        dispatch({ type: 'ADD_USER_MESSAGE_PENDING', payload: { id: messageId, transcript, line } });

        try {
            const feedback = await getPronunciationFeedback(transcript, line.russian);
            dispatch({ type: 'UPDATE_USER_MESSAGE_FEEDBACK', payload: { id: messageId, feedback } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました。';
            dispatch({ type: 'UPDATE_USER_MESSAGE_ERROR', payload: { id: messageId, error: errorMessage } });
        }

    }, []);

    const proceedToNextLine = useCallback(() => {
        dispatch({ type: 'PROCEED_TO_NEXT_LINE' });
    }, []);

    const endRoleplay = useCallback(() => {
        dispatch({ type: 'END_ROLEPLAY' });
    }, []);

    return {
        ...state,
        selectRole,
        addAiMessage,
        addUserMessage,
        endRoleplay,
        proceedToNextLine,
    };
};