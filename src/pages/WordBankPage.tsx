
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Brain,
    ChevronRight,
    RotateCcw,
    CheckCircle2,
    XCircle,
    BookOpen,
    Trophy
} from 'lucide-react';
import { wordBankService, BoxItem } from '@/services/wordBankService';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { gamificationService } from '@/services/gamificationService';
import { Navbar } from '@/components/Navbar';
import { Sparkles } from 'lucide-react';

export const WordBankPage = () => {
    const navigate = useNavigate();
    const [dueItems, setDueItems] = useState<BoxItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [earnedXP, setEarnedXP] = useState(0);
    const [leveledUp, setLeveledUp] = useState(false);
    const { speak } = useTextToSpeech();

    useEffect(() => {
        const items = wordBankService.getDueItems();
        setDueItems(items);
    }, []);

    const handleResult = (success: boolean) => {
        const item = dueItems[currentIndex];
        wordBankService.updateReview(item.id, success);

        if (success) {
            setEarnedXP(prev => prev + 5);
        }

        if (currentIndex < dueItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // End of session - update global progress
            const finalXP = earnedXP + (success ? 5 : 0);
            const { leveledUp: isLevelUp } = gamificationService.updateProgress(finalXP);
            setLeveledUp(isLevelUp);
            setSessionComplete(true);
        }
    };

    if (dueItems.length === 0 && !sessionComplete) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="glass p-12 rounded-3xl text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-display font-bold">All caught up!</h1>
                    <p className="text-muted-foreground">
                        Your memory is fresh. Come back tomorrow for your next Spaced Repetition review.
                    </p>
                    <Button onClick={() => navigate('/lessons')} className="w-full h-12 rounded-xl">
                        Explore New Lessons
                    </Button>
                </div>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-12 rounded-3xl space-y-8 max-w-md border-2 border-primary/20 relative overflow-hidden"
                >
                    {leveledUp && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-primary text-white py-2 px-6 rounded-full inline-block font-bold text-sm absolute top-4 right-4"
                        >
                            LEVEL UP!
                        </motion.div>
                    )}

                    <div className="relative">
                        <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 bg-primary text-white rounded-2xl absolute -bottom-4 -right-4 font-black shadow-lg"
                        >
                            +{earnedXP} XP
                        </motion.div>
                    </div>

                    <h2 className="text-4xl font-display font-black">Memory Mastered!</h2>
                    <p className="text-muted-foreground text-lg">
                        You've strengthened your long-term retention using the GemiTalk Spaced Repetition System.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => navigate('/dashboard')} className="w-full h-14 rounded-2xl text-lg shadow-lg">
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => window.location.reload()} className="w-full h-12 rounded-xl text-muted-foreground">
                            Review Again
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentItem = dueItems[currentIndex];

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-6">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Progress Header */}
                <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Focus Session</span>
                    <span>{currentIndex + 1} / {dueItems.length} Items</span>
                </div>

                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        animate={{ width: `${((currentIndex + 1) / dueItems.length) * 100}%` }}
                    />
                </div>

                {/* Card Container */}
                <div className="perspective-1000 h-[300px] relative">
                    <motion.div
                        className="w-full h-full relative transition-all duration-500 transform-style-3d cursor-pointer"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front: English */}
                        <div className="absolute inset-0 backface-hidden glass rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-2 border-primary/10">
                            <span className="text-xs font-bold uppercase text-primary/60">English</span>
                            <p className="text-3xl font-display font-bold">"{currentItem.sentence.text}"</p>
                            <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={(e) => { e.stopPropagation(); speak(currentItem.sentence.text); }}>
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-4 animate-pulse">Tap to see translation</p>
                        </div>

                        {/* Back: Translation */}
                        <div className="absolute inset-0 backface-hidden glass rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6 border-2 border-accent/20 [transform:rotateY(180deg)]">
                            <span className="text-xs font-bold uppercase text-accent/60">Translation</span>
                            <p className="text-2xl font-bold text-accent">{currentItem.sentence.translation}</p>
                            <div className="p-4 bg-secondary/50 rounded-2xl">
                                <p className="text-sm text-muted-foreground italic">"{currentItem.sentence.explanation}"</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Response Controls */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        size="xl"
                        className="h-20 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10"
                        onClick={() => handleResult(false)}
                    >
                        <XCircle className="mr-2 w-6 h-6" />
                        Still Weak
                    </Button>
                    <Button
                        size="xl"
                        className="h-20 rounded-2xl bg-success hover:bg-success/90 text-white shadow-xl shadow-success/20"
                        onClick={() => handleResult(true)}
                    >
                        <CheckCircle2 className="mr-2 w-6 h-6" />
                        Grasped It
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WordBankPage;
