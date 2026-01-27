/**
 * Custom Hook for Text-to-Speech
 * 
 * Provides easy-to-use TTS interface for React components
 */

import { useState, useCallback, useEffect } from 'react';
import { ttsService } from '@/services/ttsService';

interface UseTextToSpeechReturn {
    speak: (text: string, slow?: boolean) => Promise<void>;
    stop: () => void;
    isSpeaking: boolean;
    isReady: boolean;
    voices: SpeechSynthesisVoice[];
    setVoice: (voiceName: string) => void;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isReady] = useState(ttsService.isReady());
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        // Load voices
        setVoices(ttsService.getEnglishVoices());

        // Listen for speech end to update state
        const checkInterval = setInterval(() => {
            setIsSpeaking(ttsService.isSpeaking());
        }, 100);

        return () => clearInterval(checkInterval);
    }, []);

    const speak = useCallback(async (text: string, slow: boolean = false) => {
        try {
            setIsSpeaking(true);
            if (slow) {
                await ttsService.speakSlow(text);
            } else {
                await ttsService.speakNormal(text);
            }
        } catch (error) {
            console.error('TTS error:', error);
        } finally {
            setIsSpeaking(false);
        }
    }, []);

    const stop = useCallback(() => {
        ttsService.stop();
        setIsSpeaking(false);
    }, []);

    const setVoice = useCallback((voiceName: string) => {
        ttsService.setDefaultVoice(voiceName);
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
        isReady,
        voices,
        setVoice,
    };
};
