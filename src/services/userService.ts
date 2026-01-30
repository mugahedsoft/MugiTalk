import { supabase } from '@/lib/supabase';
import type { UserProgress, UserAchievement } from '@/types';
import { storageService } from './storageService';

class UseService {
    /**
     * Sync user progress from Supabase to local storage
     */
    async syncProgress(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }

        // AUTO-CREATE PROFILE if it doesn't exist (Fixes PGRST116)
        if (!data) {
            console.log('No profile found. Creating default profile for user:', userId);
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                    id: userId,
                    total_xp: 0,
                    current_streak: 0,
                    longest_streak: 0,
                    level: 'A1',
                    lessons_completed: 0,
                    exercises_completed: 0,
                    pronunciation_accuracy: 0,
                    weekly_goal: 150,
                    weekly_progress: 0
                }])
                .select()
                .single();

            if (createError) {
                console.error('Failed to auto-create profile:', createError);
                throw createError;
            }

            const progress = this.mapToProgress(newProfile);
            storageService.setProgress(progress);
            return progress;
        }

        const progress = this.mapToProgress(data);
        storageService.setProgress(progress);
        return progress;
    }

    private mapToProgress(data: any): UserProgress {
        return {
            userId: data.id,
            totalXP: data.total_xp || 0,
            currentStreak: data.current_streak || 0,
            longestStreak: data.longest_streak || 0,
            lessonsCompleted: data.lessons_completed || 0,
            exercisesCompleted: data.exercises_completed || 0,
            pronunciationAccuracy: data.pronunciation_accuracy || 0,
            level: data.level || 'A1',
            weeklyGoal: data.weekly_goal || 150,
            weeklyProgress: data.weekly_progress || 0,
        };
    }
    /**
     * Update remote profile with automatic camelCase to snake_case mapping
     */
    async updateRemoteProgress(userId: string, updates: Partial<UserProgress>) {
        const mappedUpdates: any = {};

        // Map frontend camelCase to Supabase snake_case
        if (updates.totalXP !== undefined) mappedUpdates.total_xp = updates.totalXP;
        if (updates.currentStreak !== undefined) mappedUpdates.current_streak = updates.currentStreak;
        if (updates.longestStreak !== undefined) mappedUpdates.longest_streak = updates.longestStreak;
        if (updates.lessonsCompleted !== undefined) mappedUpdates.lessons_completed = updates.lessonsCompleted;
        if (updates.exercisesCompleted !== undefined) mappedUpdates.exercises_completed = updates.exercisesCompleted;
        if (updates.pronunciationAccuracy !== undefined) mappedUpdates.pronunciation_accuracy = updates.pronunciationAccuracy;
        if (updates.level !== undefined) mappedUpdates.level = updates.level;
        if (updates.weeklyGoal !== undefined) mappedUpdates.weekly_goal = updates.weeklyGoal;
        if (updates.weeklyProgress !== undefined) mappedUpdates.weekly_progress = updates.weeklyProgress;

        const { error } = await supabase
            .from('profiles')
            .update(mappedUpdates)
            .eq('id', userId);

        if (error) {
            console.error('Supabase Update Error:', error);
            throw error;
        }
    }

    /**
     * Fetch achievements
     */
    async getAchievements(userId: string) {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    }
}

export const userService = new UseService();
export default userService;
