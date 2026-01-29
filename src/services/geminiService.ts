import { config } from '@/config/env';
import type { ConversationMessage, GrammarCorrection, PronunciationFeedback } from '@/types';

// API Base URL - In production this would be an environment variable
const API_URL = 'http://localhost:3000/api';

/**
 * Gemini AI Service - Client Side
 * Connects to the backend API for secure AI processing
 */
class GeminiService {
    private isConfigured: boolean = false;
    private chatHistory: { role: 'user' | 'model', parts: string }[] = [];
    private currentLevel: string = 'A1';

    constructor() {
        // Check if configuration exists (even though we don't use the key here directly anymore, 
        // we might want to check if the backend is reachable or if the env var exists for the backend to use)
        this.isConfigured = !!config.GEMINI_API_KEY;
    }

    /**
     * Initialize and start a chat session
     */
    public async startConversation(scenario: string, level: string, role: string): Promise<string> {
        this.chatHistory = [];
        this.currentLevel = level;

        const systemPrompt = `
You are ${role}, helping an English learner practice conversation.
The learner's level is ${level}.
The scenario is: ${scenario}.

Instructions:
1. Keep your responses concise (1-3 sentences).
2. Correct major grammar mistakes gently if they impede understanding.
3. Ask relevant follow-up questions to keep the conversation going.
4. Speak naturally for the role.
5. Do not break character.
`;

        try {
            const response = await this.sendMessage("Hello!", systemPrompt);
            return response;
        } catch (error) {
            console.error('Error starting conversation:', error);
            throw error;
        }
    }

    /**
     * Send a message to the AI
     */
    public async sendMessage(message: string, systemPrompt?: string): Promise<string> {
        try {
            // Optimistic update for history
            if (!systemPrompt) { // Don't add system prompt trigger to user history
                this.chatHistory.push({ role: 'user', parts: message });
            }

            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    history: this.chatHistory.map(h => ({
                        role: h.role === 'user' ? 'user' : 'ai',
                        content: h.parts
                    })),
                    systemPrompt,
                    level: this.currentLevel
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.response;

            this.chatHistory.push({ role: 'model', parts: text });
            return text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('Failed to connect to AI service. Ensure backend is running.');
        }
    }

    /**
     * Analyze text for grammar and style
     */
    public async analyzeText(text: string, expected?: string): Promise<GrammarCorrection[]> {
        try {
            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'grammar',
                    text
                })
            });

            if (!response.ok) throw new Error('Analysis failed');
            return await response.json();
        } catch (error) {
            console.error('Analysis Error:', error);
            return [];
        }
    }

    /**
     * Get pronunciation tips and feedback
     */
    public async getPronunciationFeedback(text: string, originalText: string): Promise<PronunciationFeedback> {
        try {
            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'pronunciation',
                    text,
                    expected: originalText
                })
            });

            if (!response.ok) throw new Error('Pronunciation analysis failed');
            return await response.json();
        } catch (error) {
            console.error('Analysis Error:', error);
            return { overallScore: 0, wordBreakdown: [], strengths: [], improvements: [], aiTip: "Could not analyze" };
        }
    }

    public clearConversation() {
        this.chatHistory = [];
    }

    public isReady(): boolean {
        return this.isConfigured;
    }
}

export const geminiService = new GeminiService();
export default geminiService;
