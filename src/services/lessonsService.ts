/**
 * Lessons Data Service
 * 
 * Manages lesson data, progress tracking, and provides
 * an interface for accessing learning content
 */

import { allLessons } from '@/data/lessonsData';
import type { Lesson, UserLevel } from '@/types';

class LessonsService {
    private lessons: Lesson[];

    constructor() {
        this.lessons = allLessons as any[];
    }

    /**
     * Get all lessons
     */
    public getAllLessons(): Lesson[] {
        return this.lessons;
    }

    /**
     * Get lessons filtered by level
     */
    public getLessonsByLevel(level: UserLevel): Lesson[] {
        return this.lessons.filter(lesson => lesson.level === level);
    }

    /**
     * Get lessons by category
     */
    public getLessonsByCategory(category: string): Lesson[] {
        return this.lessons.filter(lesson => lesson.category === category);
    }

    /**
     * Get a specific lesson by ID
     */
    public getLessonById(id: string): Lesson | undefined {
        return this.lessons.find(lesson => lesson.id === id);
    }

    /**
     * Get recommended lessons based on user level and progress
     */
    public getRecommendedLessons(userLevel: UserLevel, completedIds: string[] = []): Lesson[] {
        // Get lessons at or slightly above user level
        const levelOrder: UserLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levelOrder.indexOf(userLevel);
        const targetLevels = levelOrder.slice(0, userLevelIndex + 2); // Current + 1 level up

        return this.lessons
            .filter(lesson =>
                targetLevels.includes(lesson.level) &&
                !completedIds.includes(lesson.id) &&
                !lesson.isLocked
            )
            .slice(0, 5); // Return top 5 recommendations
    }

    /**
     * Get next lesson in sequence
     */
    public getNextLesson(currentLessonId: string): Lesson | undefined {
        const currentIndex = this.lessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex === -1 || currentIndex === this.lessons.length - 1) {
            return undefined;
        }
        return this.lessons[currentIndex + 1];
    }

    /**
     * Get all available categories
     */
    public getCategories(): string[] {
        return Array.from(new Set(this.lessons.map(l => l.category)));
    }

    /**
     * Search lessons by keyword
     */
    public searchLessons(query: string): Lesson[] {
        const lowerQuery = query.toLowerCase();
        return this.lessons.filter(lesson =>
            lesson.title.toLowerCase().includes(lowerQuery) ||
            lesson.description.toLowerCase().includes(lowerQuery) ||
            lesson.category.toLowerCase().includes(lowerQuery)
        );
    }
}

// Export singleton
export const lessonsService = new LessonsService();
export default lessonsService;
