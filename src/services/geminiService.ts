/**
 * Gemini AI Service
 * 
 * Provides AI-powered features:
 * - Intelligent conversation partner
 * - Grammar correction and feedback
 * - Personalized learning recommendations
 * - Context-aware explanations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '@/config/env';
import type {
    ConversationMessage,
    GrammarCorrection,
    PronunciationFeedback
} from '@/types';

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private conversationHistory: ConversationMessage[] = [];
    private initialized = false;

    constructor() {
        this.initialize();
    }

    /**
     * Initialize the Gemini AI client
     */
    private initialize(): void {
        try {
            if (!config.GEMINI_API_KEY) {
                console.warn('Gemini API key not configured. AI features will be disabled.');
                return;
            }

            this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-pro',
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
            });
            this.initialized = true;
            console.log('✅ Gemini AI service initialized');
        } catch (error) {
            console.error('Failed to initialize Gemini AI:', error);
            this.initialized = false;
        }
    }

    /**
     * Check if the service is ready to use
     */
    public isReady(): boolean {
        return this.initialized && this.model !== null;
    }

    /**
     * Start a new conversation with a specific scenario
     */
    public async startConversation(
        scenario: string,
        userLevel: string,
        characterRole: string
    ): Promise<string> {
        if (!this.isReady()) {
            throw new Error('Gemini AI service is not initialized');
        }

        const systemPrompt = `You are ${characterRole}, helping an English learner at ${userLevel} level practice ${scenario}. 
    
Your role:
- Speak naturally but adjust complexity to their level
- Gently correct mistakes without being discouraging
- Ask follow-up questions to keep conversation flowing
- Provide encouraging feedback
- Use realistic, practical language for this scenario

Keep responses concise (2-3 sentences max). Be friendly and supportive.`;

        try {
            this.conversationHistory = [];
            const chat = this.model.startChat({
                history: [],
                generationConfig: {
                    temperature: 0.8, // More creative for conversation
                    maxOutputTokens: 200, // Keep responses short
                },
            });

            const result = await chat.sendMessage(systemPrompt + '\n\nStart the conversation naturally.');
            const response = result.response.text();

            // Store in history
            this.conversationHistory.push({
                id: Date.now().toString(),
                role: 'ai',
                content: response,
                timestamp: new Date(),
            });

            return response;
        } catch (error) {
            console.error('Error starting conversation:', error);
            throw new Error('Failed to start AI conversation');
        }
    }

    /**
     * Continue an ongoing conversation
     */
    public async sendMessage(message: string): Promise<string> {
        if (!this.isReady()) {
            throw new Error('Gemini AI service is not initialized');
        }

        try {
            // Add user message to history
            this.conversationHistory.push({
                id: Date.now().toString(),
                role: 'user',
                content: message,
                timestamp: new Date(),
            });

            // Create chat with history
            const chat = this.model.startChat({
                history: this.conversationHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            });

            const result = await chat.sendMessage(message);
            const response = result.response.text();

            // Add AI response to history
            this.conversationHistory.push({
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: response,
                timestamp: new Date(),
            });

            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error('Failed to get AI response');
        }
    }

    /**
     * Analyze user's spoken/written text and provide corrections
     */
    public async analyzeText(
        text: string,
        expectedText?: string
    ): Promise<GrammarCorrection[]> {
        if (!this.isReady()) {
            return [];
        }

        try {
            const prompt = expectedText
                ? `Compare these two English texts and identify any differences, errors, or areas for improvement:

Expected: "${expectedText}"
User said: "${text}"

Provide specific corrections in this exact JSON format (no markdown, just JSON):
[
  {
    "original": "the incorrect phrase",
    "corrected": "the correct phrase",
    "explanation": "brief explanation",
    "errorType": "grammar|vocabulary|pronunciation|style"
  }
]

If there are no errors, return an empty array: []`
                : `Analyze this English text for grammar, vocabulary, and style improvements:

"${text}"

Provide corrections in this exact JSON format (no markdown, just JSON):
[
  {
    "original": "the phrase to improve",
    "corrected": "the improved phrase",
    "explanation": "why this is better",
    "errorType": "grammar|vocabulary|pronunciation|style"
  }
]

If the text is perfect, return an empty array: []`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Extract JSON from response (remove markdown code blocks if present)
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                return [];
            }

            const corrections: GrammarCorrection[] = JSON.parse(jsonMatch[0]);
            return corrections;
        } catch (error) {
            console.error('Error analyzing text:', error);
            return [];
        }
    }

    /**
     * Generate a helpful tip based on the user's pronunciation attempt
     */
    public async generatePronunciationTip(
        targetSentence: string,
        userTranscript: string,
        problemWords: string[]
    ): Promise<string> {
        if (!this.isReady()) {
            return "Keep practicing! Try to speak clearly and at a natural pace.";
        }

        try {
            const prompt = `A student is practicing English pronunciation. They tried to say:
"${targetSentence}"

But the speech recognition heard:
"${userTranscript}"

The problem words are: ${problemWords.join(', ')}

Provide ONE short, encouraging tip (1-2 sentences) to help them improve. Be specific and actionable.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('Error generating tip:', error);
            return "Focus on pronouncing each word clearly. Try speaking more slowly at first.";
        }
    }

    /**
     * Generate a personalized explanation for a grammar point or vocabulary word
     */
    public async explainConcept(concept: string, context?: string): Promise<string> {
        if (!this.isReady()) {
            return "Explanation not available. Please check your AI service configuration.";
        }

        try {
            const prompt = context
                ? `Explain this English concept in 2-3 simple sentences: "${concept}"
        
Context: ${context}

Keep it beginner-friendly and practical.`
                : `Explain this English concept in 2-3 simple sentences: "${concept}"

Keep it beginner-friendly with a practical example.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('Error explaining concept:', error);
            return "Unable to generate explanation at this time.";
        }
    }

    /**
     * Reset conversation history
     */
    public clearConversation(): void {
        this.conversationHistory = [];
    }

    /**
     * Get current conversation history
     */
    public getHistory(): ConversationMessage[] {
        return [...this.conversationHistory];
    }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
