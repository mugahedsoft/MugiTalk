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
            .single();

        if (error) throw error;

        if (data) {
            const progress: UserProgress = {
                userId: data.id,
                totalXP: data.totalxp || 0,
                currentStreak: data.currentstreak || 0,
                longestStreak: data.longeststreak || 0,
                lessonsCompleted: data.lessonscompleted || 0,
                exercisesCompleted: data.exercisescompleted || 0,
                pronunciationAccuracy: data.pronunciationaccuracy || 0,
                level: data.level || 'A1',
                weeklyGoal: data.weeklygoal || 150,
                weeklyProgress: data.weeklyprogress || 0,
            };

            storageService.setProgress(progress);
            return progress;
        }
        return null;
    }

    /**
     * Update remote profile
     */
    async updateRemoteProgress(userId: string, updates: Partial<UserProgress>) {
        // Map internal camelCase to snake_case for DB if needed, 
        // but here we'll assume the client handles the mapping or DB matches.
        // For MVP, simple update:
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
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
