/**
 * Speech Recognition Service
 * 
 * Handles speech-to-text using Web Speech API
 * Provides real-time transcription and pronunciation analysis
 * 
 * Architecture Decision: Using Web Speech API for MVP
 * - ✅ Free and built into modern browsers
 * - ✅ No backend required, client-side only
 * - ❌ Chrome/Edge only (but that's 80%+ of users)
 * - Future: Can upgrade to Google Cloud Speech-to-Text for better accuracy
 */

import type { SpeechRecognitionResult, WordRecognition } from '@/types';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface WebkitSpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => WebkitSpeechRecognition;
        webkitSpeechRecognition: new () => WebkitSpeechRecognition;
    }
}

type RecognitionCallback = (result: SpeechRecognitionResult) => void;
type ErrorCallback = (error: string) => void;

class SpeechRecognitionService {
    private recognition: WebkitSpeechRecognition | null = null;
    private isListening = false;
    private onResultCallback: RecognitionCallback | null = null;
    private onErrorCallback: ErrorCallback | null = null;

    constructor() {
        this.initialize();
    }

    /**
     * Initialize the speech recognition engine
     */
    private initialize(): void {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech Recognition not supported in this browser');
            return;
        }

        const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechAPI();

        // Configure recognition
        this.recognition.continuous = false; // Stop after one result
        this.recognition.interimResults = false; // Only final results
        this.recognition.lang = 'en-US'; // Default to US English

        // Set up event handlers
        this.setupEventHandlers();

        console.log('✅ Speech Recognition service initialized');
    }

    /**
     * Set up event handlers for recognition events
     */
    private setupEventHandlers(): void {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('🎤 Speech recognition started');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('🛑 Speech recognition ended');
        };

        this.recognition.onerror = (event: any) => {
            this.isListening = false;
            const errorMessage = this.getErrorMessage(event.error);
            console.error('Speech recognition error:', errorMessage);

            if (this.onErrorCallback) {
                this.onErrorCallback(errorMessage);
            }
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[event.resultIndex];
            const alternative = result[0];

            const recognitionResult: SpeechRecognitionResult = {
                transcript: alternative.transcript,
                confidence: alternative.confidence,
                words: [],
                overallScore: Math.round(alternative.confidence * 100),
            };

            console.log('📝 Transcription:', recognitionResult.transcript);
            console.log('🎯 Confidence:', recognitionResult.confidence);

            if (this.onResultCallback) {
                this.onResultCallback(recognitionResult);
            }
        };
    }

    /**
     * Convert error codes to user-friendly messages
     */
    private getErrorMessage(error: string): string {
        const errorMessages: Record<string, string> = {
            'no-speech': 'No speech detected. Please try again.',
            'audio-capture': 'Microphone not accessible. Please check permissions.',
            'not-allowed': 'Microphone permission denied. Please enable it in browser settings.',
            'network': 'Network error. Please check your connection.',
            'aborted': 'Recording was cancelled.',
        };

        return errorMessages[error] || `Speech recognition error: ${error}`;
    }

    /**
     * Check if speech recognition is supported
     */
    public isSupported(): boolean {
        return this.recognition !== null;
    }

    /**
     * Check if currently listening
     */
    public getIsListening(): boolean {
        return this.isListening;
    }

    /**
     * Start listening for speech
     */
    public async startListening(
        onResult: RecognitionCallback,
        onError: ErrorCallback,
        language: string = 'en-US'
    ): Promise<void> {
        if (!this.recognition) {
            onError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        if (this.isListening) {
            console.warn('Already listening');
            return;
        }

        this.onResultCallback = onResult;
        this.onErrorCallback = onError;
        this.recognition.lang = language;

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            onError('Failed to start recording. Please try again.');
        }
    }

    /**
     * Stop listening for speech
     */
    public stopListening(): void {
        if (!this.recognition || !this.isListening) {
            return;
        }

        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Failed to stop recognition:', error);
        }
    }

    /**
     * Analyze pronunciation by comparing expected vs actual text
     */
    public analyzePronunciation(
        expected: string,
        actual: string,
        confidence: number
    ): { words: WordRecognition[]; overallScore: number } {
        const expectedWords = expected.toLowerCase().split(/\s+/);
        const actualWords = actual.toLowerCase().split(/\s+/);

        const wordResults: WordRecognition[] = [];
        let totalAccuracy = 0;
        let matchCount = 0;

        // Compare word by word
        for (let i = 0; i < expectedWords.length; i++) {
            const expectedWord = expectedWords[i].replace(/[.,!?;:]/g, '');
            const actualWord = actualWords[i]?.replace(/[.,!?;:]/g, '') || '';

            const isCorrect = expectedWord === actualWord;
            const accuracy = isCorrect ? 100 : this.calculateWordSimilarity(expectedWord, actualWord);

            totalAccuracy += accuracy;
            if (isCorrect) matchCount++;

            wordResults.push({
                word: actualWord || '(missing)',
                expectedWord,
                isCorrect,
                accuracy,
                feedback: this.getWordFeedback(expectedWord, actualWord, accuracy),
                status: this.getWordStatus(accuracy),
            });
        }

        // Calculate overall score (blend of word accuracy + API confidence)
        const wordAccuracyScore = expectedWords.length > 0
            ? totalAccuracy / expectedWords.length
            : 0;
        const overallScore = Math.round((wordAccuracyScore * 0.7) + (confidence * 100 * 0.3));

        return {
            words: wordResults,
            overallScore: Math.min(100, Math.max(0, overallScore)),
        };
    }

    /**
     * Calculate similarity between two words using Levenshtein distance
     */
    private calculateWordSimilarity(expected: string, actual: string): number {
        if (expected === actual) return 100;
        if (!actual) return 0;

        const distance = this.levenshteinDistance(expected, actual);
        const maxLength = Math.max(expected.length, actual.length);
        const similarity = ((maxLength - distance) / maxLength) * 100;

        return Math.round(Math.max(0, similarity));
    }

    /**
     * Levenshtein distance algorithm for string similarity
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Get feedback message for a word
     */
    private getWordFeedback(expected: string, actual: string, accuracy: number): string {
        if (accuracy === 100) return 'Perfect pronunciation!';
        if (accuracy >= 80) return 'Very close! Minor adjustment needed.';
        if (accuracy >= 60) return 'Good attempt, practice this word more.';
        if (!actual) return `Missing word: "${expected}"`;
        return `Try again: expected "${expected}", heard "${actual}"`;
    }

    /**
     * Get status color category for a word
     */
    private getWordStatus(accuracy: number): WordRecognition['status'] {
        if (accuracy >= 95) return 'perfect';
        if (accuracy >= 80) return 'good';
        if (accuracy >= 60) return 'needs-work';
        return 'error';
    }
}

// Export singleton instance
export const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;
