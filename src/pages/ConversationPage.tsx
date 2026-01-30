/**
 * AI Conversation Practice Page
 * 
 * Real-time AI conversation with scenario-based practice
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    MessageCircle,
    Send,
    Mic,
    Volume2,
    ArrowLeft,
    Sparkles,
    Briefcase,
    UtensilsCrossed,
    Plane,
    Users,
    Loader2,
    RefreshCw,
    Stethoscope,
    Languages,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    Trophy,
    Target,
    PieChart,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { PronunciationFeedback } from '@/types';

// Icon Mapping for Dynamic AI Scenarios
const ICON_MAP: Record<string, any> = {
    MessageCircle,
    Plane,
    Briefcase,
    UtensilsCrossed,
    Users,
    Stethoscope,
};

const ScenarioSkeleton = () => (
    <div className="p-6 rounded-2xl bg-card border border-border animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-secondary mb-4" />
        <div className="h-6 w-3/4 bg-secondary rounded mb-2" />
        <div className="h-4 w-full bg-secondary rounded mb-4" />
        <div className="h-4 w-1/4 bg-secondary rounded" />
    </div>
);

export const ConversationPage = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [isFetchingScenarios, setIsFetchingScenarios] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
    const [pronunciationFeedback, setPronunciationFeedback] = useState<Record<string, PronunciationFeedback>>({});
    const [sessionSummary, setSessionSummary] = useState<any | null>(null);
    const [isTranslating, setIsTranslating] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading,
        error: aiError,
        isReady: isAIReady,
        startConversation,
        sendMessage,
        clearConversation,
        generateScenarios,
        translateText,
        generateSummary,
        getPronunciationFeedback,
    } = useGeminiAI();

    const { speak, isSpeaking } = useTextToSpeech();
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        reset: resetSpeech,
    } = useSpeechRecognition();

    // Fetch dynamic scenarios on mount
    useEffect(() => {
        const fetchScenarios = async () => {
            if (isAIReady && profile?.level) {
                setIsFetchingScenarios(true);
                const dynamicScenarios = await generateScenarios(profile.level);
                if (dynamicScenarios.length > 0) {
                    setScenarios(dynamicScenarios);
                }
                setIsFetchingScenarios(false);
            }
        };

        if (scenarios.length === 0) {
            fetchScenarios();
        }
    }, [isAIReady, profile?.level, generateScenarios, scenarios.length]);

    const handleRefreshScenarios = async () => {
        setIsFetchingScenarios(true);
        const dynamicScenarios = await generateScenarios(profile?.level || 'A2');
        if (dynamicScenarios.length > 0) {
            setScenarios(dynamicScenarios);
        }
        setIsFetchingScenarios(false);
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // When speech recognition completes, use the transcript
    useEffect(() => {
        if (transcript && !isListening) {
            setInputMessage(transcript);
            resetSpeech();
        }
    }, [transcript, isListening, resetSpeech]);

    // Auto-speak AI responses
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'ai' && !isLoading) {
            const timer = setTimeout(() => {
                speak(lastMessage.content);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [messages, isLoading, speak]);

    const handleStartScenario = async (scenario: any) => {
        setSelectedScenario(scenario);
        await startConversation(
            scenario.title,
            scenario.level,
            scenario.role
        );
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const message = inputMessage.trim();
        setInputMessage('');
        await sendMessage(message);
    };

    const handleVoiceInput = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handlePlayMessage = async (text: string) => {
        await speak(text);
    };

    const handleEndConversation = async () => {
        if (messages.length > 2) {
            setIsGeneratingSummary(true);
            try {
                const summary = await generateSummary();
                setSessionSummary(summary);
            } catch (err) {
                toast.error("Summary generation failed.");
            } finally {
                setIsGeneratingSummary(false);
            }
        } else {
            clearConversation();
            setSelectedScenario(null);
            setTranslatedMessages({});
            setPronunciationFeedback({});
        }
    };

    const handleBackToScenarios = () => {
        clearConversation();
        setSelectedScenario(null);
        setSessionSummary(null);
        setTranslatedMessages({});
        setPronunciationFeedback({});
    };

    const handleTranslate = async (messageId: string, text: string) => {
        if (translatedMessages[messageId]) {
            const newTranslations = { ...translatedMessages };
            delete newTranslations[messageId];
            setTranslatedMessages(newTranslations);
            return;
        }

        setIsTranslating(messageId);
        try {
            const translation = await translateText(text);
            setTranslatedMessages(prev => ({ ...prev, [messageId]: translation }));
        } catch (err) {
            toast.error("Translation failed.");
        } finally {
            setIsTranslating(null);
        }
    };

    const handleAnalyzePronunciation = async (messageId: string, text: string) => {
        if (pronunciationFeedback[messageId]) {
            setExpandedAnalysis(expandedAnalysis === messageId ? null : messageId);
            return;
        }

        setIsAnalyzing(messageId);
        try {
            const feedback = await getPronunciationFeedback(text, text);
            setPronunciationFeedback(prev => ({ ...prev, [messageId]: feedback }));
            setExpandedAnalysis(messageId);
        } catch (err) {
            toast.error("Analysis failed.");
        } finally {
            setIsAnalyzing(null);
        }
    };

    if (!selectedScenario) {
        return (
            <div className="min-h-screen bg-background py-10 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>

                            {isAIReady && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefreshScenarios}
                                    disabled={isFetchingScenarios}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isFetchingScenarios ? 'animate-spin' : ''}`} />
                                    Manifest New Scenarios
                                </Button>
                            )}
                        </div>

                        <div className="mb-12">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                Dynamic AI <span className="text-gradient">Scenarios</span>
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Clinical-grade conversation logic tailored for your Level {profile?.level || 'A2'} journey.
                            </p>
                        </div>

                        {!isAIReady && (
                            <div className="mb-8 p-6 rounded-2xl bg-warning/10 border border-warning/20">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-warning" />
                                    <div>
                                        <p className="font-semibold text-warning">AI Not Configured</p>
                                        <p className="text-sm text-muted-foreground">
                                            Please configure your AI services to enable dynamic scenarios.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            {isFetchingScenarios ? (
                                Array(4).fill(0).map((_, i) => <ScenarioSkeleton key={i} />)
                            ) : (
                                scenarios.map((scenario) => {
                                    const IconComponent = ICON_MAP[scenario.icon] || MessageCircle;
                                    return (
                                        <motion.button
                                            key={scenario.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed flex flex-col h-full"
                                            onClick={() => handleStartScenario(scenario)}
                                            disabled={!isAIReady}
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <IconComponent className="w-7 h-7 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                                {scenario.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                                                    Level {scenario.level} • {scenario.category}
                                                </span>
                                                <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Start →
                                                </span>
                                            </div>
                                        </motion.button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (sessionSummary) {
        return (
            <div className="min-h-screen bg-background py-10 md:py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 text-primary opacity-5">
                            <Trophy className="w-48 h-48" />
                        </div>

                        <div className="mb-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-display font-black mb-4">Linguistic Summary</h1>
                            <div className="inline-flex items-center gap-2 bg-success/10 text-success text-sm font-bold px-4 py-2 rounded-full">
                                <Sparkles className="w-4 h-4" />
                                {sessionSummary.overallGrade} Session Performance
                            </div>
                        </div>

                        <div className="grid gap-8 mb-10">
                            <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
                                <p className="text-lg leading-relaxed text-foreground italic">
                                    "{sessionSummary.summary}"
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                        <Target className="w-4 h-4" />
                                        Key Strengths
                                    </div>
                                    <ul className="space-y-3">
                                        {sessionSummary.strengths.map((s: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                        <PieChart className="w-4 h-4" />
                                        Areas for Improvement
                                    </div>
                                    <ul className="space-y-3">
                                        {sessionSummary.weaknesses.map((w: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="border-t border-border pt-10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Path to Mastery
                                </h3>
                                <div className="grid gap-4">
                                    {sessionSummary.nextSteps.map((step: string, i: number) => (
                                        <div key={i} className="flex items-center gap-4 bg-primary/5 border border-primary/10 p-5 rounded-2xl">
                                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black">
                                                {i + 1}
                                            </div>
                                            <p className="font-medium text-foreground/90">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <Button className="flex-1 py-7 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" onClick={handleBackToScenarios}>
                                Start New Scenario
                            </Button>
                            <Button variant="outline" className="flex-1 py-7 rounded-2xl text-lg font-bold" onClick={() => navigate('/dashboard')}>
                                <LogOut className="w-5 h-5 mr-2" />
                                Exit Practice
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                {(() => {
                                    const Icon = ICON_MAP[selectedScenario.icon] || MessageCircle;
                                    return <Icon className="w-6 h-6 text-primary" />;
                                })()}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">{selectedScenario.title}</h2>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    {selectedScenario.role}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={handleEndConversation} disabled={isGeneratingSummary}>
                            {isGeneratingSummary ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                'End Conversation'
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-8 max-w-4xl">
                    {aiError && (
                        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <p className="text-destructive text-sm font-medium">{aiError}</p>
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex flex-col mb-8 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[85%] relative ${message.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none shadow-lg shadow-primary/10'
                                    : 'bg-card border border-border text-foreground rounded-2xl rounded-bl-none shadow-sm'
                                    } p-5`}>

                                    {message.role === 'ai' && (
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 opacity-70">
                                            {selectedScenario.role}
                                        </div>
                                    )}

                                    <p className="text-sm md:text-base leading-relaxed font-medium">
                                        {message.content}
                                    </p>

                                    <AnimatePresence>
                                        {translatedMessages[message.id] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-primary/10 text-sm italic font-arabic flex flex-col gap-1"
                                                dir="rtl"
                                            >
                                                <span className="text-[10px] uppercase tracking-widest font-sans font-black opacity-40">Arabic Translation</span>
                                                <div className="text-foreground/90">
                                                    {translatedMessages[message.id]}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                        {expandedAnalysis === message.id && pronunciationFeedback[message.id] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-5 pt-5 border-t border-white/20 flex flex-col gap-5 overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between bg-white/10 rounded-2xl p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-5 h-5 text-orange-200" />
                                                        <span className="text-xs font-black uppercase tracking-widest text-white/80">Articulation Score</span>
                                                    </div>
                                                    <span className="text-2xl font-display font-black text-white">{pronunciationFeedback[message.id].overallScore}%</span>
                                                </div>

                                                <div className="flex flex-wrap gap-2.5">
                                                    {pronunciationFeedback[message.id].wordBreakdown.map((w, i) => (
                                                        <div key={i} className="flex flex-col items-center">
                                                            <span className={`text-sm font-bold px-3 py-1 rounded-xl ${w.status === 'perfect' ? 'bg-success/20 text-success-foreground border border-success/30' :
                                                                    w.status === 'good' ? 'bg-success/10 text-success-foreground border border-success/10' :
                                                                        w.status === 'needs-work' ? 'bg-orange-400/20 text-orange-200 border border-orange-400/30' :
                                                                            'bg-destructive/20 text-destructive-foreground border border-destructive/30'
                                                                }`}>
                                                                {w.word}
                                                            </span>
                                                            {w.phoneticHelp && (
                                                                <span className="text-[9px] font-mono text-white/40 mt-1.5 uppercase font-bold">{w.phoneticHelp}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {pronunciationFeedback[message.id].aiTip && (
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                            <Info className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Clinical Coaching</span>
                                                            <p className="text-xs text-white/90 font-arabic leading-relaxed" dir="rtl">
                                                                {pronunciationFeedback[message.id].aiTip}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="mt-4 flex items-center gap-5">
                                        {message.role === 'ai' ? (
                                            <>
                                                <button
                                                    onClick={() => handlePlayMessage(message.content)}
                                                    className="flex items-center gap-2 text-xs font-bold text-primary hover:opacity-80 transition-all"
                                                    disabled={isSpeaking}
                                                >
                                                    <Volume2 className="w-4 h-4" />
                                                    {isSpeaking ? 'Playing...' : 'Listen'}
                                                </button>

                                                <button
                                                    onClick={() => handleTranslate(message.id, message.content)}
                                                    className={`flex items-center gap-2 text-xs font-bold transition-all ${translatedMessages[message.id]
                                                            ? 'text-success'
                                                            : 'text-primary hover:opacity-80'
                                                        }`}
                                                    disabled={isTranslating === message.id}
                                                >
                                                    {isTranslating === message.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Languages className="w-4 h-4" />
                                                    )}
                                                    {translatedMessages[message.id] ? 'Translated' : 'Translate'}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleAnalyzePronunciation(message.id, message.content)}
                                                className={`flex items-center gap-2 text-xs font-bold transition-all ${pronunciationFeedback[message.id]
                                                        ? 'text-white'
                                                        : 'text-white/60 hover:text-white'
                                                    }`}
                                                disabled={isAnalyzing === message.id}
                                            >
                                                {isAnalyzing === message.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                ) : pronunciationFeedback[message.id] ? (
                                                    expandedAnalysis === message.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4" />
                                                )}
                                                {pronunciationFeedback[message.id] ? (expandedAnalysis === message.id ? 'Collapse' : 'Analyze Speech') : 'Analyze Speech'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex justify-start mb-8">
                            <div className="bg-card border border-border rounded-2xl px-5 py-3 flex gap-2.5 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-10" />
                </div>
            </main>

            <footer className="border-t border-border bg-card/80 backdrop-blur-md p-4 md:p-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleVoiceInput}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening
                                ? 'bg-destructive text-white shadow-lg shadow-destructive/20 animate-pulse'
                                : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                }`}
                            disabled={isLoading}
                        >
                            <Mic className="w-6 h-6" />
                        </motion.button>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={isListening ? 'Listening...' : "Reply to the AI..."}
                                className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary/30 rounded-2xl px-6 py-4 transition-all outline-none text-base font-medium"
                                disabled={isLoading || isListening}
                            />
                            <AnimatePresence>
                                {inputMessage.trim() && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute right-2 top-2"
                                    >
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={isLoading}
                                            size="icon"
                                            className="w-11 h-11 rounded-xl shadow-lg"
                                        >
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ConversationPage;
