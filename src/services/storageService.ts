/**
 * Local Storage Service
 * 
 * Handles all local storage operations for user data, progress, and preferences
 * Following offline-first architecture for MVP
 */

import type { User, UserProgress, UserAchievement, Conversation, DailyGoal } from '@/types';

const STORAGE_KEYS = {
    USER: 'mugitalk_user',
    PROGRESS: 'mugitalk_progress',
    COMPLETED_LESSONS: 'mugitalk_completed_lessons',
    ACHIEVEMENTS: 'mugitalk_achievements',
    DAILY_GOAL: 'mugitalk_daily_goal',
    CONVERSATIONS: 'mugitalk_conversations',
    PREFERENCES: 'mugitalk_preferences',
} as const;

class LocalStorageService {
    /**
     * Generic get method with type safety
     */
    private get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return null;
        }
    }

    /**
     * Generic set method
     */
    private set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }

    // ========== User Management ==========

    public getUser(): User | null {
        return this.get<User>(STORAGE_KEYS.USER);
    }

    public setUser(user: User): void {
        this.set(STORAGE_KEYS.USER, user);
    }

    public clearUser(): void {
        localStorage.removeItem(STORAGE_KEYS.USER);
    }

    // ========== Progress Tracking ==========

    public getProgress(): UserProgress | null {
        return this.get<UserProgress>(STORAGE_KEYS.PROGRESS);
    }

    public setProgress(progress: UserProgress): void {
        this.set(STORAGE_KEYS.PROGRESS, progress);
    }

    public updateProgress(updates: Partial<UserProgress>): void {
        const current = this.getProgress() || this.getDefaultProgress();
        this.setProgress({ ...current, ...updates });
    }

    private getDefaultProgress(): UserProgress {
        return {
            userId: 'local',
            totalXP: 0,
            currentStreak: 0,
            longestStreak: 0,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            pronunciationAccuracy: 0,
            level: 'A1',
            weeklyGoal: 150, // 150 minutes per week
            weeklyProgress: 0,
        };
    }

    // ========== Completed Lessons ==========

    public getCompletedLessons(): string[] {
        return this.get<string[]>(STORAGE_KEYS.COMPLETED_LESSONS) || [];
    }

    public saveLessonCompletion(lessonId: string, accuracy: number): void {
        const completed = this.getCompletedLessons();
        if (!completed.includes(lessonId)) {
            completed.push(lessonId);
            this.set(STORAGE_KEYS.COMPLETED_LESSONS, completed);
        }

        // Update global accuracy and lesson count
        const current = this.getProgress() || this.getDefaultProgress();
        const newTotalLessons = completed.length;
        // Simple average for pronunciation accuracy
        const newAccuracy = Math.round((current.pronunciationAccuracy + accuracy) / 2);

        this.updateProgress({
            lessonsCompleted: newTotalLessons,
            pronunciationAccuracy: newAccuracy
        });
    }

    public isLessonCompleted(lessonId: string): boolean {
        return this.getCompletedLessons().includes(lessonId);
    }

    // ========== Achievements ==========

    public getAchievements(): UserAchievement[] {
        return this.get<UserAchievement[]>(STORAGE_KEYS.ACHIEVEMENTS) || [];
    }

    public addAchievement(achievement: UserAchievement): void {
        const achievements = this.getAchievements();
        achievements.push(achievement);
        this.set(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    }

    // ========== Daily Goal ==========

    public getDailyGoal(): DailyGoal | null {
        const goal = this.get<DailyGoal>(STORAGE_KEYS.DAILY_GOAL);

        // Check if it's for today
        if (goal && this.isToday(new Date(goal.date))) {
            return goal;
        }

        // Create new goal for today
        return this.createTodayGoal();
    }

    private createTodayGoal(): DailyGoal {
        const progress = this.getProgress() || this.getDefaultProgress();
        const goal: DailyGoal = {
            userId: 'local',
            date: new Date(),
            targetMinutes: Math.ceil(progress.weeklyGoal / 7), // Daily target based on weekly goal
            completedMinutes: 0,
            isCompleted: false,
        };
        this.set(STORAGE_KEYS.DAILY_GOAL, goal);
        return goal;
    }

    public updateDailyGoal(minutesToAdd: number): void {
        const goal = this.getDailyGoal()!;
        goal.completedMinutes = Math.min(goal.completedMinutes + minutesToAdd, goal.targetMinutes);
        goal.isCompleted = goal.completedMinutes >= goal.targetMinutes;
        this.set(STORAGE_KEYS.DAILY_GOAL, goal);

        // Also update weekly progress
        const progress = this.getProgress() || this.getDefaultProgress();
        this.updateProgress({ weeklyProgress: progress.weeklyProgress + minutesToAdd });
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    // ========== Conversations ==========

    public saveConversation(conversation: Conversation): void {
        const conversations = this.getConversations();
        const existingIndex = conversations.findIndex(c => c.id === conversation.id);

        if (existingIndex >= 0) {
            conversations[existingIndex] = conversation;
        } else {
            conversations.push(conversation);
        }

        this.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }

    public getConversations(): Conversation[] {
        return this.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    }

    public getConversationById(id: string): Conversation | undefined {
        return this.getConversations().find(c => c.id === id);
    }

    // ========== Preferences ==========

    public getPreference<T>(key: string, defaultValue: T): T {
        const prefs = this.get<Record<string, unknown>>(STORAGE_KEYS.PREFERENCES) || {};
        return (prefs[key] as T) ?? defaultValue;
    }

    public setPreference(key: string, value: unknown): void {
        const prefs = this.get<Record<string, unknown>>(STORAGE_KEYS.PREFERENCES) || {};
        prefs[key] = value;
        this.set(STORAGE_KEYS.PREFERENCES, prefs);
    }

    // ========== Clear All Data ==========

    public clearAllData(): void {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // ========== Export/Import ==========

    public exportData(): string {
        const data = {
            user: this.getUser(),
            progress: this.getProgress(),
            completedLessons: this.getCompletedLessons(),
            achievements: this.getAchievements(),
            conversations: this.getConversations(),
            exportDate: new Date().toISOString(),
        };
        return JSON.stringify(data, null, 2);
    }

    public importData(jsonString: string): void {
        try {
            const data = JSON.parse(jsonString);

            if (data.user) this.setUser(data.user);
            if (data.progress) this.setProgress(data.progress);
            if (data.completedLessons) this.set(STORAGE_KEYS.COMPLETED_LESSONS, data.completedLessons);
            if (data.achievements) this.set(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
            if (data.conversations) this.set(STORAGE_KEYS.CONVERSATIONS, data.conversations);

            console.log('✅ Data imported successfully');
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Invalid import data format');
        }
    }
}

// Export singleton
export const storageService = new LocalStorageService();
export default storageService;
