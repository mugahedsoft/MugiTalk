import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { supabase } from '@/lib/supabase';
import type { User, UserProgress } from '@/types';

interface AuthContextType {
    user: any | null;
    profile: UserProgress | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<UserProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                try {
                    const userProfile = await userService.syncProgress(session.user.id);
                    setProfile(userProfile);
                } catch (err) {
                    console.error('Initial profile sync failed:', err);
                }
            }
            setLoading(false);
        };

        init();

        // Listen for auth state changes (PRO FIX)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, !!session);

            if (session?.user) {
                setUser(session.user);
                try {
                    const userProfile = await userService.syncProgress(session.user.id);
                    setProfile(userProfile);
                } catch (err) {
                    console.error('Sync error during auth change:', err);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const refreshProfile = async () => {
        if (user) {
            const updated = await userService.syncProgress(user.id);
            setProfile(updated);
        }
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
