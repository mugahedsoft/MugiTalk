
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Mic,
    Volume2,
    ChevronRight,
    Sparkles,
    Brain,
    Trophy,
    Target
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { storageService } from '@/services/storageService';
import { lessonsService } from '@/services/lessonsService';
import type { UserLevel } from '@/types';

const TEST_SENTENCES = [
    { text: "The cat is on the table.", level: "A1" as UserLevel, translation: "القطة على الطاولة." },
    { text: "I enjoy traveling to different countries to experience new cultures.", level: "B1" as UserLevel, translation: "أستمتع بالسفر إلى دول مختلفة لتجربة ثقافات جديدة." },
    { text: "The unprecedented economic shift necessitates a radical re-evaluation of our fiscal policies.", level: "C1" as UserLevel, translation: "التحول الاقتصادي غير المسبوق يتطلب إعادة تقييم جذرية لسياساتنا المالية." }
];

export const PlacementTestPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'testing' | 'analyzing' | 'result'>('intro');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [scores, setScores] = useState<{ level: UserLevel, score: number }[]>([]);
    const [finalLevel, setFinalLevel] = useState<UserLevel | null>(null);

    const { isListening, transcript, overallScore, startListening, stopListening, reset } = useSpeechRecognition();
    const { speak, isSpeaking } = useTextToSpeech();
    const { analyzeText } = useGeminiAI();

    const handleStartTest = () => {
        setStep('testing');
    };

    const handleNext = async () => {
        // Save score for current level
        setScores(prev => [...prev, { level: TEST_SENTENCES[currentIdx].level, score: overallScore }]);

        if (currentIdx < TEST_SENTENCES.length - 1) {
            setCurrentIdx(prev => prev + 1);
            reset();
        } else {
            setStep('analyzing');
            await calculateResult();
        }
    };

    const calculateResult = async () => {
        // Logic to determine level
        // Simple heuristic: highest level with > 70% score
        let determinedLevel: UserLevel = 'A1';
        const sortedScores = [...scores].sort((a, b) => {
            const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            return levels.indexOf(b.level) - levels.indexOf(a.level);
        });

        const success = sortedScores.find(s => s.score > 70);
        if (success) {
            determinedLevel = success.level;
        }

        setFinalLevel(determinedLevel);

        // Save to storage
        const progress = storageService.getProgress() || {
            userId: 'local',
            totalXP: 0,
            currentStreak: 0,
            longestStreak: 0,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            pronunciationAccuracy: 0,
            level: 'A1',
            weeklyGoal: 150,
            weeklyProgress: 0,
        };

        storageService.setProgress({
            ...progress,
            level: determinedLevel
        });

        setTimeout(() => setStep('result'), 2000);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-20 px-6">
            <div className="max-w-2xl w-full">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass p-10 rounded-3xl text-center space-y-8"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                                <Brain className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-display font-bold">Placement Test</h1>
                                <p className="text-muted-foreground text-lg">
                                    Let's find the perfect starting point for you.
                                    Speak 3 sentences to help our AI determine your level.
                                </p>
                            </div>
                            <Button size="lg" className="w-full text-lg h-14 rounded-2xl" onClick={handleStartTest}>
                                Start Assessment
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 'testing' && (
                        <motion.div
                            key="testing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass p-10 rounded-3xl space-y-8"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-semibold text-primary">QUESTION {currentIdx + 1}/3</span>
                                <span className="px-3 py-1 bg-secondary rounded-full text-xs font-bold">{TEST_SENTENCES[currentIdx].level}</span>
                            </div>

                            <p className="text-3xl font-display font-bold text-center">
                                "{TEST_SENTENCES[currentIdx].text}"
                            </p>

                            <p className="text-center text-muted-foreground">
                                {TEST_SENTENCES[currentIdx].translation}
                            </p>

                            <div className="flex justify-center gap-4">
                                <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={() => speak(TEST_SENTENCES[currentIdx].text)}>
                                    <Volume2 className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="pt-8 flex flex-col items-center gap-6">
                                <button
                                    onClick={isListening ? stopListening : () => startListening(TEST_SENTENCES[currentIdx].text)}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-destructive scale-110 animate-pulse' : 'bg-primary hover:scale-105 shadow-xl'
                                        }`}
                                >
                                    <Mic className="w-10 h-10 text-white" />
                                </button>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {isListening ? "Listening... Speak now!" : "Tap the mic and read the sentence."}
                                </p>
                            </div>

                            {transcript && !isListening && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-6 bg-secondary/30 rounded-2xl text-center space-y-4"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Target className="w-5 h-5 text-primary" />
                                        <span className="font-bold text-2xl">{overallScore}% Accuracy</span>
                                    </div>
                                    <Button className="w-full rounded-xl" onClick={handleNext}>
                                        {currentIdx === 2 ? "Finalize Assessment" : "Next Sentence"}
                                        <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {step === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass p-20 rounded-3xl text-center space-y-8"
                        >
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                                <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Analyzing your performance...</h2>
                                <p className="text-muted-foreground">Our AI is determining your proficiency level based on pronunciation and flow.</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass p-12 rounded-3xl text-center space-y-8 border-2 border-primary/30"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto rotate-12 shadow-2xl">
                                <Trophy className="w-12 h-12 text-white -rotate-12" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-primary font-bold tracking-widest uppercase">Assessment Complete</p>
                                <h2 className="text-5xl font-display font-black">Level {finalLevel}</h2>
                                <p className="text-muted-foreground max-w-xs mx-auto text-lg">
                                    Great job! We've unlocked the perfect learning path for you.
                                </p>
                            </div>
                            <Button size="lg" className="w-full h-14 rounded-2xl text-lg shadow-lg" onClick={() => navigate('/dashboard')}>
                                Go to Dashboard
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PlacementTestPage;
