/**
 * Dashboard / Home Page
 * 
 * Overview of user progress, daily goals, and quick access to features
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Target,
    TrendingUp,
    Award,
    BookOpen,
    MessageCircle,
    Mic,
    ArrowRight,
    Flame,
    Sparkles,
    Brain
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { lessonsService } from '@/services/lessonsService';
import { gamificationService } from '@/services/gamificationService';
import { useLocation } from 'react-router-dom';
import type { UserProgress, DailyGoal, Lesson } from '@/types';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
    const [recommendedLessons, setRecommendedLessons] = useState<Lesson[]>([]);

    // Celebration State
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(1);

    useEffect(() => {
        // Check for level-up notification from navigation state
        if (location.state?.leveledUp) {
            setNewLevel(location.state.level);
            setShowLevelUp(true);
            // Clear state so it doesn't show again on refresh
            window.history.replaceState({}, document.title);
        }

        // Load user data
        const userProgress = storageService.getProgress() || {
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
        setProgress(userProgress);

        const goal = storageService.getDailyGoal();
        setDailyGoal(goal);

        // Get recommended lessons
        const completed = storageService.getCompletedLessons();
        const recommended = lessonsService.getRecommendedLessons(userProgress.level, completed);
        setRecommendedLessons(recommended);
    }, [location.state]);

    const dailyProgress = dailyGoal
        ? Math.min(100, (dailyGoal.completedMinutes / dailyGoal.targetMinutes) * 100)
        : 0;

    const currentLevelInfo = gamificationService.getLevelFromXP(progress?.totalXP || 0);
    const nextLevelInfo = gamificationService.getNextLevelInfo(progress?.totalXP || 0);

    const xpProgress = nextLevelInfo
        ? ((progress?.totalXP || 0) - currentLevelInfo.xpRequired) / (nextLevelInfo.xpRequired - currentLevelInfo.xpRequired) * 100
        : 100;

    return (
        <div className="min-h-screen bg-background py-10 md:py-20">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto relative">
                    {/* Level Up Celebration */}
                    <AnimatePresence>
                        {showLevelUp && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="glass p-12 rounded-[40px] text-center max-w-lg border-2 border-primary shadow-2xl shadow-primary/20"
                                >
                                    <Sparkles className="w-20 h-20 text-yellow-500 mx-auto mb-6 animate-bounce" />
                                    <h2 className="text-5xl font-black mb-4 text-gradient">LEVEL UP!</h2>
                                    <p className="text-2xl font-bold mb-8">You reached Level {newLevel}: {currentLevelInfo.title}</p>
                                    <Button size="xl" onClick={() => setShowLevelUp(false)} className="w-full h-16 rounded-3xl text-xl shadow-xl">
                                        Keep Learning
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                    Welcome back, <span className="text-gradient">Language Master</span>
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    You're doing amazing. Your current streak is {progress?.currentStreak} days!
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-sm font-bold uppercase tracking-widest text-primary">Level {currentLevelInfo.level}: {currentLevelInfo.title}</span>
                                <div className="w-48 h-3 bg-secondary rounded-full overflow-hidden border border-border">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary to-accent"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpProgress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">{progress?.totalXP} / {nextLevelInfo?.xpRequired || 'MAX'} XP</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Word Bank / SRS Notification */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 p-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl"
                    >
                        <div className="glass rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6" onClick={() => navigate('/review')}>
                            <div className="flex items-center gap-4 text-center md:text-left cursor-pointer group">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <Brain className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Memory Review Due</h2>
                                    <p className="text-muted-foreground">You have weak areas waiting for review. Strengthen your long-term memory now.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button size="lg" className="rounded-xl h-14 px-8 shadow-lg shadow-primary/20">
                                    Start Review
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* Daily Goal Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white shadow-xl shadow-primary/20"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Target className="w-8 h-8" />
                                <span className="text-2xl font-bold">{dailyGoal?.completedMinutes || 0}/{dailyGoal?.targetMinutes || 20}</span>
                            </div>
                            <h3 className="font-semibold mb-2 text-lg">Daily Practice</h3>
                            <div className="w-full bg-white/20 rounded-full h-3 mb-3 border border-white/10">
                                <div
                                    className="bg-white h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${dailyProgress}%` }}
                                />
                            </div>
                            <p className="text-sm font-medium opacity-90">
                                {dailyProgress >= 100 ? '🎉 Goal Achieved!' : `${(dailyGoal?.targetMinutes || 20) - (dailyGoal?.completedMinutes || 0)} mins to go`}
                            </p>
                        </motion.div>

                        {/* Streak Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-3xl bg-card border-2 border-orange-500/10 hover:border-orange-500/30 transition-all group shadow-sm"
                        >
                            <div className="flex justify-between mb-4">
                                <div className="p-3 bg-orange-100 rounded-2xl">
                                    <Flame className="w-8 h-8 text-orange-500 group-hover:animate-bounce" />
                                </div>
                                <span className="text-4xl font-display font-black text-orange-600">{progress?.currentStreak || 0}</span>
                            </div>
                            <h3 className="font-bold text-lg">Day Streak</h3>
                            <p className="text-sm text-muted-foreground">
                                Keep it up! Longest: {progress?.longestStreak || 0}
                            </p>
                        </motion.div>

                        {/* Total XP Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-3xl bg-card border-2 border-primary/10 hover:border-primary/30 transition-all group shadow-sm"
                        >
                            <div className="flex justify-between mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <TrendingUp className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-4xl font-display font-black text-primary">{progress?.totalXP || 0}</span>
                            </div>
                            <h3 className="font-bold text-lg">Total XP</h3>
                            <p className="text-sm text-muted-foreground">
                                {nextLevelInfo ? `${nextLevelInfo.xpRequired - (progress?.totalXP || 0)} XP to Next Level` : 'Legendary Level Reached!'}
                            </p>
                        </motion.div>

                        {/* Accuracy Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-3xl bg-card border-2 border-success/10 hover:border-success/30 transition-all group shadow-sm"
                        >
                            <div className="flex justify-between mb-4">
                                <div className="p-3 bg-success/10 rounded-2xl">
                                    <Award className="w-8 h-8 text-success" />
                                </div>
                                <span className="text-4xl font-display font-black text-success">{progress?.pronunciationAccuracy || 0}%</span>
                            </div>
                            <h3 className="font-bold text-lg">Avg Accuracy</h3>
                            <p className="text-sm text-muted-foreground">
                                Your clinical speaking score
                            </p>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-display font-bold mb-6">Quick Start</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate('/lessons')}
                                className="group p-6 rounded-2xl bg-gradient-to-br from-primary via-orange-400 to-accent text-white hover:shadow-xl transition-all"
                            >
                                <Mic className="w-10 h-10 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Speaking Practice</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Practice pronunciation with AI feedback
                                </p>
                                <div className="flex items-center text-sm font-medium">
                                    Start Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/conversation')}
                                className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all"
                            >
                                <MessageCircle className="w-10 h-10 mb-4 text-accent" />
                                <h3 className="text-xl font-semibold mb-2">AI Conversation</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Chat with AI in realistic scenarios
                                </p>
                                <div className="flex items-center text-sm font-medium text-accent">
                                    Start Chat <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/achievements')}
                                className="group p-6 rounded-2xl bg-card border border-border hover:border-success/30 hover:shadow-lg transition-all"
                            >
                                <Award className="w-10 h-10 mb-4 text-success" />
                                <h3 className="text-xl font-semibold mb-2">Achievements</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    View your badges and progress
                                </p>
                                <div className="flex items-center text-sm font-medium text-success">
                                    View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </motion.div>

                    {/* Recommended Lessons */}
                    {recommendedLessons.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-display font-bold">Recommended for You</h2>
                                <Button variant="ghost" onClick={() => navigate('/lessons')}>
                                    View All <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendedLessons.slice(0, 3).map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => navigate(`/practice/${lesson.id}`)}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-bold">
                                                {lesson.level}
                                            </span>
                                            <span className="px-2 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs capitalize">
                                                {lesson.category.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {lesson.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {lesson.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {lesson.sentences.length} sentences
                                            </span>
                                            <Button variant="ghost" size="sm" className="gap-1">
                                                Starts <Sparkles className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
