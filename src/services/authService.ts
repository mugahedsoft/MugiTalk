import { supabase } from '@/lib/supabase';
import type { User, UserProgress } from '@/types';
import { storageService } from './storageService';

class AuthService {
    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string, fullName: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) throw error;

        if (data.user) {
            // Initialize profile in DB
            await this.initializeProfile(data.user.id, fullName);
        }

        return data;
    }

    /**
     * Sign in existing user
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // Clear local storage if needed
        storageService.clearAllData();
    }

    /**
     * Get current session
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    }

    /**
     * Initialize a new user profile with default learning stats
     */
    private async initializeProfile(userId: string, fullName: string) {
        const defaultProgress: Partial<UserProgress> = {
            userId,
            totalXP: 0,
            currentStreak: 0,
            longestStreak: 0,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            pronunciationAccuracy: 0,
            level: 'A1',
        };

        const { error } = await supabase
            .from('profiles')
            .insert([
                {
                    id: userId,
                    full_name: fullName,
                    ...defaultProgress
                }
            ]);

        if (error) {
            console.error('Error initializing profile:', error);
        }
    }
}

export const authService = new AuthService();
export default authService;
