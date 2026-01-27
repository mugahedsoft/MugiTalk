/**
 * Custom Hook for Speech Recognition
 * 
 * Provides easy-to-use interface for speech recognition in React components
 */

import { useState, useCallback, useRef } from 'react';
import { speechRecognitionService } from '@/services/speechRecognitionService';
import type { SpeechRecognitionResult, WordRecognition } from '@/types';

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    confidence: number;
    wordAnalysis: WordRecognition[];
    overallScore: number;
    error: string | null;
    startListening: (expectedText?: string) => void;
    stopListening: () => void;
    reset: () => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [wordAnalysis, setWordAnalysis] = useState<WordRecognition[]>([]);
    const [overallScore, setOverallScore] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const expectedTextRef = useRef<string>('');
    const isSupported = speechRecognitionService.isSupported();

    const handleResult = useCallback((result: SpeechRecognitionResult) => {
        setTranscript(result.transcript);
        setConfidence(result.confidence);
        setIsListening(false);
        setError(null);

        // If we have expected text, analyze pronunciation
        if (expectedTextRef.current) {
            const analysis = speechRecognitionService.analyzePronunciation(
                expectedTextRef.current,
                result.transcript,
                result.confidence
            );

            setWordAnalysis(analysis.words);
            setOverallScore(analysis.overallScore);
        } else {
            setOverallScore(result.overallScore);
        }
    }, []);

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
        setIsListening(false);
    }, []);

    const startListening = useCallback((expectedText?: string) => {
        if (!isSupported) {
            setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        if (isListening) {
            console.warn('Already listening');
            return;
        }

        expectedTextRef.current = expectedText || '';
        setError(null);
        setIsListening(true);

        speechRecognitionService.startListening(
            handleResult,
            handleError,
            'en-US'
        );
    }, [isListening, isSupported, handleResult, handleError]);

    const stopListening = useCallback(() => {
        if (isListening) {
            speechRecognitionService.stopListening();
            setIsListening(false);
        }
    }, [isListening]);

    const reset = useCallback(() => {
        setTranscript('');
        setConfidence(0);
        setWordAnalysis([]);
        setOverallScore(0);
        setError(null);
        expectedTextRef.current = '';
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        confidence,
        wordAnalysis,
        overallScore,
        error,
        startListening,
        stopListening,
        reset,
    };
};
