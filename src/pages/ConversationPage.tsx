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
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { ConversationScenario } from '@/types';

const scenarios = [
    {
        id: 'job-interview' as ConversationScenario,
        title: 'Job Interview',
        description: 'Practice answering common interview questions',
        icon: Briefcase,
        role: 'David, the Hiring Manager',
        level: 'B2',
        color: 'from-primary to-orange-400',
    },
    {
        id: 'restaurant' as ConversationScenario,
        title: 'Restaurant',
        description: 'Order food and interact with a waiter',
        icon: UtensilsCrossed,
        role: 'Maria, the Waitress',
        level: 'A2',
        color: 'from-accent to-teal-400',
    },
    {
        id: 'airport' as ConversationScenario,
        title: 'Airport Check-in',
        description: 'Navigate airport procedures',
        icon: Plane,
        role: 'John, the Airport Agent',
        level: 'B1',
        color: 'from-blue-400 to-cyan-400',
    },
    {
        id: 'small-talk' as ConversationScenario,
        title: 'Small Talk',
        description: 'Casual conversation practice',
        icon: Users,
        role: 'Emma, a Friendly Colleague',
        level: 'A2',
        color: 'from-amber-400 to-orange-400',
    },
];

export const ConversationPage = () => {
    const navigate = useNavigate();
    const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading,
        error: aiError,
        isReady: isAIReady,
        startConversation,
        sendMessage,
        clearConversation,
    } = useGeminiAI();

    const { speak, isSpeaking } = useTextToSpeech();
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        reset: resetSpeech,
    } = useSpeechRecognition();

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
            // Small delay to feel natural
            const timer = setTimeout(() => {
                speak(lastMessage.content);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [messages, isLoading, speak]);

    const handleStartScenario = async (scenario: typeof scenarios[0]) => {
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

    const handleEndConversation = () => {
        clearConversation();
        setSelectedScenario(null);
    };

    if (!selectedScenario) {
        // Scenario Selection
        return (
            <div className="min-h-screen bg-background py-10 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-12">
                            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                        </div>

                        <div className="mb-12">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                AI Conversation <span className="text-gradient">Practice</span>
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Choose a scenario and practice real conversations with AI
                            </p>
                        </div>

                        {!isAIReady && (
                            <div className="mb-8 p-6 rounded-2xl bg-warning/10 border border-warning/20">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-warning" />
                                    <div>
                                        <p className="font-semibold text-warning">AI Not Configured</p>
                                        <p className="text-sm text-muted-foreground">
                                            Please add your Gemini API key to the .env file to enable AI conversations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scenarios Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {scenarios.map((scenario) => (
                                <motion.button
                                    key={scenario.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleStartScenario(scenario)}
                                    disabled={!isAIReady}
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scenario.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <scenario.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {scenario.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                                            Level {scenario.level}
                                        </span>
                                        <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            Start →
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Conversation Interface
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedScenario.color} flex items-center justify-center`}>
                                <selectedScenario.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold">{selectedScenario.title}</h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    {selectedScenario.role}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleEndConversation}>
                            End Conversation
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-8 max-w-4xl">
                    {aiError && (
                        <div className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                            <p className="text-destructive text-sm">{aiError}</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] ${message.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                                    : 'bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md'
                                    } p-4`}>
                                    {message.role === 'ai' && (
                                        <div className="text-xs font-semibold opacity-70 mb-1">
                                            {selectedScenario.role}
                                        </div>
                                    )}
                                    <p className="text-sm">{message.content}</p>
                                    {message.role === 'ai' && (
                                        <button
                                            onClick={() => handlePlayMessage(message.content)}
                                            className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
                                            disabled={isSpeaking}
                                        >
                                            <Volume2 className="w-3 h-3" />
                                            {isSpeaking ? 'Playing...' : 'Listen'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-secondary rounded-2xl p-4">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-card">
                <div className="container mx-auto px-6 py-4 max-w-4xl">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleVoiceInput}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening
                                ? 'bg-destructive text-white animate-pulse'
                                : 'bg-secondary hover:bg-secondary/80'
                                }`}
                            disabled={isLoading}
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={isListening ? 'Listening...' : "Type your message..."}
                            className="flex-1 bg-secondary rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isLoading || isListening}
                        />

                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            size="icon"
                            className="w-12 h-12 rounded-full"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationPage;
