/**
 * Text-to-Speech Service
 * 
 * Provides natural-sounding speech synthesis for:
 * - Sentence pronunciation examples
 * - Word pronunciation
 * - AI conversation responses
 * 
 * Using Web Speech API for MVP (free, no backend required)
 */

import { config } from '@/config/env';

interface TTSOptions {
    rate?: number; // 0.1 - 10 (default: 1)
    pitch?: number; // 0 - 2 (default: 1)
    volume?: number; // 0 - 1 (default: 1)
    voice?: SpeechSynthesisVoice;
    lang?: string;
}

class TextToSpeechService {
    private synthesis: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private defaultVoice: SpeechSynthesisVoice | null = null;
    private isInitialized = false;

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.loadVoices();
    }

    /**
     * Load available voices
     */
    private loadVoices(): void {
        const setVoices = () => {
            this.voices = this.synthesis.getVoices();

            // Find best English voice
            this.defaultVoice =
                this.voices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
                this.voices.find(v => v.lang === 'en-US') ||
                this.voices.find(v => v.lang.startsWith('en')) ||
                this.voices[0];

            if (this.voices.length > 0) {
                this.isInitialized = true;
                console.log(`✅ TTS initialized with ${this.voices.length} voices`);
                console.log('Default voice:', this.defaultVoice?.name);
            }
        };

        // Voices might load asynchronously
        setVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = setVoices;
        }
    }

    /**
     * Speak text with options
     */
    public speak(text: string, options: TTSOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                reject(new Error('TTS not initialized. Voices not loaded yet.'));
                return;
            }

            // Stop any ongoing speech
            this.stop();

            const utterance = new SpeechSynthesisUtterance(text);

            // Set options
            utterance.rate = options.rate ?? 1.0;
            utterance.pitch = options.pitch ?? 1.0;
            utterance.volume = options.volume ?? 1.0;
            utterance.voice = options.voice ?? this.defaultVoice;
            utterance.lang = options.lang ?? config.DEFAULT_LANGUAGE;

            // Event handlers
            utterance.onend = () => {
                console.log('🔊 Speech finished');
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('TTS error:', event);
                reject(new Error(`Speech synthesis failed: ${event.error}`));
            };

            // Speak
            this.synthesis.speak(utterance);
        });
    }

    /**
     * Speak with slower rate for learning
     */
    public speakSlow(text: string, options: TTSOptions = {}): Promise<void> {
        return this.speak(text, { ...options, rate: 0.75 });
    }

    /**
     * Speak at normal conversation speed
     */
    public speakNormal(text: string, options: TTSOptions = {}): Promise<void> {
        return this.speak(text, { ...options, rate: 1.0 });
    }

    /**
     * Stop current speech
     */
    public stop(): void {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
    }

    /**
     * Pause current speech
     */
    public pause(): void {
        if (this.synthesis.speaking) {
            this.synthesis.pause();
        }
    }

    /**
     * Resume paused speech
     */
    public resume(): void {
        if (this.synthesis.paused) {
            this.synthesis.resume();
        }
    }

    /**
     * Check if currently speaking
     */
    public isSpeaking(): boolean {
        return this.synthesis.speaking;
    }

    /**
     * Get available voices
     */
    public getVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    /**
     * Get English voices only
     */
    public getEnglishVoices(): SpeechSynthesisVoice[] {
        return this.voices.filter(v => v.lang.startsWith('en'));
    }

    /**
     * Set default voice by name
     */
    public setDefaultVoice(voiceName: string): void {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.defaultVoice = voice;
            console.log('Default voice changed to:', voiceName);
        }
    }

    /**
     * Check if service is ready
     */
    public isReady(): boolean {
        return this.isInitialized;
    }
}

// Export singleton
export const ttsService = new TextToSpeechService();
export default ttsService;
