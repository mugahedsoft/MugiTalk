import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    ChevronRight,
    Check,
    Lock,
    Search,
    Filter,
    Clock,
    Star
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { lessonsService } from '@/services/lessonsService';
import { storageService } from '@/services/storageService';
import type { Lesson, UserLevel } from '@/types';

export const LessonsPage = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [filterLevel, setFilterLevel] = useState<UserLevel | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Load lessons with search support
        let filtered = searchQuery.trim()
            ? lessonsService.searchLessons(searchQuery)
            : lessonsService.getAllLessons();

        // Apply filters
        if (filterLevel !== 'all') {
            filtered = filtered.filter(l => l.level === filterLevel);
        }
        if (filterCategory !== 'all') {
            filtered = filtered.filter(l => l.category === filterCategory);
        }

        setLessons(filtered);
        setCompletedLessons(storageService.getCompletedLessons());
    }, [filterLevel, filterCategory, searchQuery]);

    const levels: (UserLevel | 'all')[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const categories = ['all', ...lessonsService.getCategories()];

    const handleStartLesson = (lessonId: string) => {
        navigate(`/practice/${lessonId}`);
    };

    // Group lessons by category for the roadmap
    const modules = categories.filter(c => c !== 'all').map(category => ({
        name: category,
        lessons: lessons.filter(l => l.category === category)
    }));

    return (
        <div className="min-h-screen bg-background py-10 md:py-20">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                Your Academic <span className="text-gradient">Roadmap</span>
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Structured modules designed by AI to take you from {filterLevel === 'all' ? 'A1' : filterLevel} to perfection.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setFilterLevel(level)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterLevel === level
                                        ? 'bg-primary text-white shadow-md scale-105'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {level === 'all' ? 'Expert Path' : level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Roadmap Search */}
                    <div className="mb-12 relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search topics, skills or vocabulary..."
                            className="w-full pl-12 pr-4 py-4 bg-secondary/30 rounded-2xl border border-border/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Modules Flow */}
                    <div className="space-y-16">
                        {modules.map((module, mIdx) => (
                            <div key={module.name} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-display font-bold capitalize px-6 py-2 bg-secondary rounded-2xl border border-border/50">
                                        Module {mIdx + 1}: {module.name.replace('-', ' ')}
                                    </h2>
                                    <div className="h-px bg-border flex-1" />
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {module.lessons.map((lesson, index) => {
                                        const isCompleted = completedLessons.includes(lesson.id);
                                        return (
                                            <motion.div
                                                key={lesson.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${lesson.isLocked
                                                        ? 'bg-muted/20 border-border/30 grayscale'
                                                        : 'bg-card border-border hover:border-primary/50 hover:shadow-2xl cursor-pointer'
                                                    }`}
                                                onClick={() => !lesson.isLocked && handleStartLesson(lesson.id)}
                                            >
                                                {isCompleted && (
                                                    <div className="absolute top-0 right-0 p-2 bg-status-perfect text-white rounded-bl-2xl">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-xs font-black opacity-30">#{index + 1}</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${lesson.level.startsWith('A') ? 'bg-green-500/10 text-green-600' :
                                                            lesson.level.startsWith('B') ? 'bg-orange-500/10 text-orange-600' :
                                                                'bg-red-500/10 text-red-600'
                                                        }`}>
                                                        {lesson.level}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold mb-2 leading-tight">{lesson.title}</h3>
                                                <p className="text-xs text-muted-foreground mb-6 line-clamp-2">{lesson.description}</p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                        <Clock className="w-3 h-3" />
                                                        {lesson.estimatedMinutes} Mins
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-8 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {isCompleted ? 'Review' : 'Start'}
                                                        <ChevronRight className="ml-1 w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {modules.length === 0 && (
                        <div className="text-center py-32 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
                            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold mb-2">Roadmap path is clear</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                No modules match your current search or filters. Try a different level or simpler keyword.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonsPage;
