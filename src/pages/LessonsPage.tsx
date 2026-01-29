/**
 * Lessons Listing Page
 * 
 * Browse and select lessons to practice
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, Check, Lock } from 'lucide-react';
import { lessonsService } from '@/services/lessonsService';
import { storageService } from '@/services/storageService';
import type { Lesson, UserLevel } from '@/types';

export const LessonsPage = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [filterLevel, setFilterLevel] = useState<UserLevel | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        // Load lessons
        let filteredLessons = lessonsService.getAllLessons();

        // Apply filters
        if (filterLevel !== 'all') {
            filteredLessons = filteredLessons.filter(l => l.level === filterLevel);
        }
        if (filterCategory !== 'all') {
            filteredLessons = filteredLessons.filter(l => l.category === filterCategory);
        }

        setLessons(filteredLessons);
        setCompletedLessons(storageService.getCompletedLessons());
    }, [filterLevel, filterCategory]);

    const levels: (UserLevel | 'all')[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const categories = ['all', ...lessonsService.getCategories()];

    const handleStartLesson = (lessonId: string) => {
        navigate(`/practice/${lessonId}`);
    };

    return (
        <div className="min-h-screen bg-background py-10 md:py-20">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Learn English with <span className="text-gradient">AI-Powered Lessons</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Choose a lesson and start practicing your pronunciation with real-time feedback
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-8 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Filter by Level</label>
                            <div className="flex flex-wrap gap-2">
                                {levels.map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setFilterLevel(level)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterLevel === level
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        {level === 'all' ? 'All Levels' : level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Filter by Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setFilterCategory(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${filterCategory === category
                                            ? 'bg-accent text-accent-foreground shadow-md'
                                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        {category === 'all' ? 'All Topics' : category.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lessons Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((lesson, index) => {
                            const isCompleted = completedLessons.includes(lesson.id);

                            return (
                                <motion.div
                                    key={lesson.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group p-6 rounded-2xl border transition-all duration-300 ${lesson.isLocked
                                        ? 'bg-muted/50 border-border/50 opacity-75'
                                        : 'bg-card border-border hover:border-primary/30 hover:shadow-lg cursor-pointer'
                                        }`}
                                    onClick={() => !lesson.isLocked && handleStartLesson(lesson.id)}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${lesson.level === 'A1' ? 'bg-green-100 text-green-700' :
                                                    lesson.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                                                        lesson.level === 'B1' ? 'bg-orange-100 text-orange-700' :
                                                            lesson.level === 'B2' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {lesson.level}
                                                </span>
                                                <span className="px-2 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium capitalize">
                                                    {lesson.category.replace('-', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        {isCompleted ? (
                                            <div className="w-8 h-8 rounded-full bg-status-perfect flex items-center justify-center">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                        ) : lesson.isLocked ? (
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                <Lock className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {lesson.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{lesson.sentences.length} sentences</span>
                                        </div>
                                        <span>{lesson.estimatedMinutes} min</span>
                                    </div>

                                    {/* Action Button */}
                                    {!lesson.isLocked && (
                                        <Button
                                            variant={isCompleted ? 'outline' : 'default'}
                                            className="w-full group-hover:shadow-md transition-shadow"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartLesson(lesson.id);
                                            }}
                                        >
                                            {isCompleted ? 'Practice Again' : 'Start Lesson'}
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {lessons.length === 0 && (
                        <div className="text-center py-16">
                            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No lessons found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your filters to see more lessons
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonsPage;
