/**
 * Custom Hook for Gemini AI Conversation
 * 
 * Manages AI conversation state and interactions
 */

import { useState, useCallback, useRef } from 'react';
import { geminiService } from '@/services/geminiService';
import type { ConversationMessage, GrammarCorrection } from '@/types';

interface UseGeminiAIReturn {
    messages: ConversationMessage[];
    isLoading: boolean;
    error: string | null;
    isReady: boolean;
    startConversation: (scenario: string, level: string, role: string) => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
    analyzeText: (text: string, expected?: string) => Promise<GrammarCorrection[]>;
    clearConversation: () => void;
}

export const useGeminiAI = (): UseGeminiAIReturn => {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isReady = geminiService.isReady();

    const conversationActiveRef = useRef(false);

    const startConversation = useCallback(async (
        scenario: string,
        level: string,
        role: string
    ) => {
        if (!isReady) {
            setError('AI service is not configured. Please add your Gemini API key.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessages([]);

        try {
            const response = await geminiService.startConversation(scenario, level, role);

            const aiMessage: ConversationMessage = {
                id: Date.now().toString(),
                role: 'ai',
                content: response,
                timestamp: new Date(),
            };

            setMessages([aiMessage]);
            conversationActiveRef.current = true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
            setError(errorMessage);
            console.error('Error starting conversation:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isReady]);

    const sendMessage = useCallback(async (messageText: string) => {
        if (!isReady) {
            setError('AI service is not available');
            return;
        }

        if (!conversationActiveRef.current) {
            setError('No active conversation. Please start a conversation first.');
            return;
        }

        // Add user message immediately
        const userMessage: ConversationMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await geminiService.sendMessage(messageText);

            const aiMessage: ConversationMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            setError(errorMessage);
            console.error('Error sending message:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isReady]);

    const analyzeText = useCallback(async (
        text: string,
        expected?: string
    ): Promise<GrammarCorrection[]> => {
        if (!isReady) {
            return [];
        }

        try {
            return await geminiService.analyzeText(text, expected);
        } catch (err) {
            console.error('Error analyzing text:', err);
            return [];
        }
    }, [isReady]);

    const clearConversation = useCallback(() => {
        setMessages([]);
        setError(null);
        conversationActiveRef.current = false;
        geminiService.clearConversation();
    }, []);

    return {
        messages,
        isLoading,
        error,
        isReady,
        startConversation,
        sendMessage,
        analyzeText,
        clearConversation,
    };
};
