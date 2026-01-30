/**
 * Speaking Practice Page
 * 
 * Real, functional speaking practice with:
 * - Speech recognition
 * - Pronunciation analysis
 * - AI feedback
 * - Progress tracking
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Mic,
    Volume2,
    Check,
    X,
    AlertCircle,
    RotateCcw,
    ChevronRight,
    Sparkles,
    ArrowLeft
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { lessonsService } from '@/services/lessonsService';
import { storageService } from '@/services/storageService';
import { geminiService } from '@/services/geminiService';
import { wordBankService } from '@/services/wordBankService';
import { gamificationService } from '@/services/gamificationService';
import type { Lesson, Sentence, PronunciationFeedback } from '@/types';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

type PracticeStep = 'listen' | 'speak' | 'feedback';

export const PracticePage = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [step, setStep] = useState<PracticeStep>('listen');
    const [sessionScore, setSessionScore] = useState<number[]>([]);

    const {
        isListening,
        transcript,
        wordAnalysis,
        overallScore,
        error: speechError,
        startListening,
        stopListening,
        reset: resetSpeech,
        isSupported
    } = useSpeechRecognition();

    const { speak, isSpeaking, stop: stopSpeech } = useTextToSpeech();
    const { analyzeText } = useGeminiAI();
    const [aiTip, setAiTip] = useState<string>('');

    // Load lesson on mount
    useEffect(() => {
        if (lessonId) {
            const loadedLesson = lessonsService.getLessonById(lessonId);
            if (loadedLesson) {
                setLesson(loadedLesson);
            } else {
                navigate('/lessons');
            }
        }
    }, [lessonId, navigate]);

    const currentSentence = lesson?.sentences[currentSentenceIndex];

    const handlePlayAudio = async () => {
        if (!currentSentence) return;
        await speak(currentSentence.text);
    };

    const handlePlaySlow = async () => {
        if (!currentSentence) return;
        await speak(currentSentence.text, true);
    };

    const handleStartRecording = () => {
        if (!currentSentence) return;
        resetSpeech();
        startListening(currentSentence.text);
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<PronunciationFeedback | null>(null);

    const handleStopRecording = async () => {
        stopListening();
        setIsAnalyzing(true);

        // Wait a bit for transcript to stabilize
        setTimeout(async () => {
            if (transcript && currentSentence) {
                try {
                    const feedback = await geminiService.getPronunciationFeedback(transcript, currentSentence.text);
                    setAiFeedback(feedback);
                    setAiTip(feedback.aiTip || '');

                    // Add to word bank if accuracy is low (< 70%) for later review
                    if (feedback.overallScore < 70) {
                        wordBankService.addToBank(currentSentence);
                    }

                    setStep('feedback');
                } catch (err) {
                    console.error("AI Analysis failed", err);
                    setStep('feedback');
                } finally {
                    setIsAnalyzing(false);
                }
            } else {
                setStep('feedback');
                setIsAnalyzing(false);
            }
        }, 800);
    };

    const { user, refreshProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleCompleteLesson = async () => {
        if (!lesson) return;

        setIsSaving(true);
        // Calculate average accuracy
        const avgScore = sessionScore.length > 0
            ? Math.round(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length)
            : 0;

        // Award XP
        const earnedXP = gamificationService.calculateXP(100, avgScore, lesson.level);
        const { leveledUp, nextLevel } = gamificationService.updateProgress(earnedXP);

        // Record completion locally
        storageService.saveLessonCompletion(lesson.id, avgScore);

        // Update daily goal locally
        storageService.updateDailyGoal(lesson.estimatedMinutes);

        // SYNC TO CLOUD if user is logged in
        if (user) {
            try {
                const currentProgress = storageService.getProgress();
                if (currentProgress) {
                    await userService.updateRemoteProgress(user.id, currentProgress);
                    await refreshProfile();
                }
            } catch (err) {
                console.error('Failed to sync progress to cloud:', err);
            }
        }

        setIsSaving(false);
        // Navigate with state for celebration
        navigate('/dashboard', {
            state: {
                leveledUp,
                nextLevel,
                earnedXP,
                level: nextLevel
            }
        });
    };


    const handleNextSentence = () => {
        if (!lesson) return;

        // Save current sentence score to the average
        const currentScore = aiFeedback?.overallScore || overallScore;
        if (currentScore > 0) {
            setSessionScore(prev => [...prev, currentScore]);
        }

        if (currentSentenceIndex < lesson.sentences.length - 1) {
            setCurrentSentenceIndex(prev => prev + 1);
            setStep('listen');
            resetSpeech();
            setAiTip('');
            setAiFeedback(null);
        } else {
            // Lesson complete
            handleCompleteLesson();
        }
    };

    const handleTryAgain = () => {
        setStep('speak');
        resetSpeech();
        setAiTip('');
        setAiFeedback(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'perfect': return 'bg-status-perfect text-white';
            case 'good': return 'bg-status-good text-white';
            case 'needs-work': return 'bg-status-needsWork text-white';
            case 'error': return 'bg-status-error text-white';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'perfect': return <Check className="w-3 h-3" />;
            case 'good': return <Check className="w-3 h-3" />;
            case 'needs-work': return <AlertCircle className="w-3 h-3" />;
            case 'error': return <X className="w-3 h-3" />;
            default: return null;
        }
    };

    if (!lesson || !currentSentence) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/lessons')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Lessons
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {currentSentenceIndex + 1} / {lesson.sentences.length}
                    </div>
                </div>

                {/* Lesson Info */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">{lesson.title}</h1>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                            {lesson.level}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                            {lesson.category.replace('-', ' ')}
                        </span>
                    </div>
                </div>

                {/* Practice Card */}
                <motion.div
                    layout
                    className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-lg"
                >
                    <AnimatePresence mode="wait">
                        {/* Listen Step */}
                        {step === 'listen' && (
                            <motion.div
                                key="listen"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-2xl md:text-3xl font-display font-semibold mb-6 text-center"  >
                                    "{currentSentence.text}"
                                </p>

                                <p className="text-lg text-muted-foreground mb-4 text-center">
                                    {currentSentence.translation}
                                </p>

                                {currentSentence.explanation && (
                                    <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-accent" />
                                            <span className="font-semibold text-accent">Explanation</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {currentSentence.explanation}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handlePlayAudio}
                                        disabled={isSpeaking}
                                    >
                                        <Volume2 className="w-4 h-4" />
                                        Play Normal
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handlePlaySlow}
                                        disabled={isSpeaking}
                                    >
                                        <Volume2 className="w-4 h-4" />
                                        Play Slow
                                    </Button>
                                </div>

                                <Button
                                    variant="hero"
                                    size="lg"
                                    className="w-full"
                                    onClick={() => setStep('speak')}
                                >
                                    Ready to Practice
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}

                        {/* Speak Step */}
                        {step === 'speak' && (
                            <motion.div
                                key="speak"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <p className="text-lg text-muted-foreground mb-4">Say this sentence:</p>
                                <p className="text-2xl md:text-3xl font-display font-semibold mb-8">
                                    "{currentSentence.text}"
                                </p>

                                {!isSupported && (
                                    <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                                        <p className="text-destructive text-sm">
                                            Speech recognition is not supported in your browser.
                                            Please use Chrome or Edge.
                                        </p>
                                    </div>
                                )}

                                {speechError && (
                                    <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                                        <p className="text-destructive text-sm">{speechError}</p>
                                    </div>
                                )}

                                <motion.button
                                    onClick={isListening ? handleStopRecording : handleStartRecording}
                                    className={`w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                                        ? 'bg-destructive shadow-lg scale-110'
                                        : 'bg-primary hover:bg-primary/90 hover:scale-105'
                                        }`}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!isSupported}
                                >
                                    <Mic className={`w-10 h-10 md:w-12 md:h-12 text-white ${isListening ? 'animate-pulse' : ''}`} />
                                </motion.button>

                                <p className="mt-6 text-muted-foreground">
                                    {isListening ? 'Recording... speak now! Tap to stop.' : 'Tap to start recording'}
                                </p>

                                {isListening && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-center gap-1 mt-4"
                                    >
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1 bg-primary rounded-full"
                                                animate={{ height: [16, 32, 16] }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.1,
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* Feedback Step */}
                        {step === 'feedback' && (
                            <motion.div
                                key="feedback"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Score Display */}
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                        className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${(aiFeedback?.overallScore || overallScore) >= 80
                                            ? 'bg-gradient-to-br from-status-perfect to-status-good'
                                            : (aiFeedback?.overallScore || overallScore) >= 60
                                                ? 'bg-gradient-to-br from-status-good to-accent'
                                                : 'bg-gradient-to-br from-status-needsWork to-status-error'
                                            } text-white`}
                                    >
                                        <span className="text-3xl font-display font-bold">{aiFeedback?.overallScore || overallScore}%</span>
                                    </motion.div>
                                    <p className="text-lg font-semibold">
                                        {(aiFeedback?.overallScore || overallScore) >= 90 ? 'Excellent!' :
                                            (aiFeedback?.overallScore || overallScore) >= 80 ? 'Great job!' :
                                                (aiFeedback?.overallScore || overallScore) >= 70 ? 'Good effort!' :
                                                    'Keep practicing!'}
                                    </p>
                                    {aiFeedback?.overallFeedback && (
                                        <p className="text-sm text-muted-foreground mt-2 px-4 italic">
                                            "{aiFeedback.overallFeedback}"
                                        </p>
                                    )}
                                </div>

                                {/* What you said */}
                                <div className="mb-6 p-4 rounded-2xl bg-secondary/50">
                                    <p className="text-sm text-muted-foreground mb-1">You said:</p>
                                    <p className="font-medium">{transcript}</p>
                                </div>

                                {/* Word Breakdown */}
                                {(aiFeedback?.wordBreakdown || wordAnalysis).length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                                        {(aiFeedback?.wordBreakdown || wordAnalysis).map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + index * 0.05 }}
                                                className="group relative"
                                            >
                                                <div className={`px-4 py-2 rounded-xl ${getStatusColor(item.status)} font-medium flex items-center gap-1`}>
                                                    {item.word}
                                                    {getStatusIcon(item.status)}
                                                </div>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    {item.phoneticHelp ? `[${item.phoneticHelp}] ` : ''}{item.feedback || 'Good'}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* AI Tip */}
                                {aiTip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-primary">AI Tip</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{aiTip}</p>
                                    </motion.div>
                                )}

                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="flex-1"
                                        onClick={handleTryAgain}
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="hero"
                                        size="lg"
                                        className="flex-1"
                                        onClick={handleNextSentence}
                                    >
                                        {currentSentenceIndex < lesson.sentences.length - 1 ? 'Next Sentence' : 'Complete Lesson'}
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default PracticePage;
