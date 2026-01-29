/**
 * Dashboard / Home Page
 * 
 * Overview of user progress, daily goals, and quick access to features
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    Sparkles
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { lessonsService } from '@/services/lessonsService';
import type { UserProgress, DailyGoal, Lesson } from '@/types';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
    const [recommendedLessons, setRecommendedLessons] = useState<Lesson[]>([]);

    useEffect(() => {
        // Load user data
        const userProgress = storageService.getProgress() || {
            userId: 'local',
            totalXP: 0,
            currentStreak: 0,
            longestStreak: 0,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            pronunciationAccuracy: 0,
            weeklyGoal: 150,
            weeklyProgress: 0,
        };
        setProgress(userProgress);

        const goal = storageService.getDailyGoal();
        setDailyGoal(goal);

        // Get recommended lessons
        const completed = storageService.getCompletedLessons();
        const recommended = lessonsService.getRecommendedLessons('B1', completed);
        setRecommendedLessons(recommended);
    }, []);

    const dailyProgress = dailyGoal
        ? Math.min(100, (dailyGoal.completedMinutes / dailyGoal.targetMinutes) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-background py-10 md:py-20">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Welcome to <span className="text-gradient">MugiTalk AI</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Your personal AI English coach. Let's make today count!
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* Daily Goal Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Target className="w-8 h-8" />
                                <span className="text-2xl font-bold">{dailyGoal?.completedMinutes || 0}/{dailyGoal?.targetMinutes || 20}</span>
                            </div>
                            <h3 className="font-semibold mb-2">Daily Goal</h3>
                            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                                <div
                                    className="bg-white h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${dailyProgress}%` }}
                                />
                            </div>
                            <p className="text-sm opacity-90">
                                {dailyProgress >= 100 ? '🎉 Goal completed!' : 'Keep going!'}
                            </p>
                        </motion.div>

                        {/* Streak Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Flame className="w-8 h-8 text-orange-500" />
                                <span className="text-3xl font-display font-bold">{progress?.currentStreak || 0}</span>
                            </div>
                            <h3 className="font-semibold mb-1">Day Streak</h3>
                            <p className="text-sm text-muted-foreground">
                                Longest: {progress?.longestStreak || 0} days
                            </p>
                        </motion.div>

                        {/* Lessons Completed */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <BookOpen className="w-8 h-8 text-accent" />
                                <span className="text-3xl font-display font-bold">{progress?.lessonsCompleted || 0}</span>
                            </div>
                            <h3 className="font-semibold mb-1">Lessons Done</h3>
                            <p className="text-sm text-muted-foreground">
                                {progress?.exercisesCompleted || 0} exercises
                            </p>
                        </motion.div>

                        {/* Accuracy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-2xl bg-card border border-border hover:border-success/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <TrendingUp className="w-8 h-8 text-success" />
                                <span className="text-3xl font-display font-bold">{progress?.pronunciationAccuracy || 0}%</span>
                            </div>
                            <h3 className="font-semibold mb-1">Accuracy</h3>
                            <p className="text-sm text-muted-foreground">
                                Average pronunciation
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
