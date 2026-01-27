/**
 * Environment Configuration
 * 
 * This file manages all environment variables and provides type-safe access.
 * For production, use proper secret management (Vercel env vars, AWS Secrets Manager, etc.)
 */

interface EnvironmentConfig {
    // API Keys
    GEMINI_API_KEY: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;

    // Feature Flags
    ENABLE_AI_CHAT: boolean;
    ENABLE_SPEECH_RECOGNITION: boolean;
    ENABLE_ANALYTICS: boolean;

    // App Config
    APP_ENV: 'development' | 'staging' | 'production';
    API_BASE_URL: string;

    // Speech Settings
    DEFAULT_LANGUAGE: string;
    DEFAULT_VOICE: string;
}

// Load from environment variables with fallbacks
const env: EnvironmentConfig = {
    // For MVP, we'll use import.meta.env (Vite's env system)
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,

    ENABLE_AI_CHAT: import.meta.env.VITE_ENABLE_AI_CHAT !== 'false', // true by default
    ENABLE_SPEECH_RECOGNITION: import.meta.env.VITE_ENABLE_SPEECH !== 'false',
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

    APP_ENV: (import.meta.env.MODE as EnvironmentConfig['APP_ENV']) || 'development',
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5173',

    DEFAULT_LANGUAGE: 'en-US',
    DEFAULT_VOICE: 'Google US English',
};

// Validation helper
export const validateConfig = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!env.GEMINI_API_KEY && env.ENABLE_AI_CHAT) {
        errors.push('GEMINI_API_KEY is required when AI chat is enabled');
    }

    if (env.SUPABASE_URL && !env.SUPABASE_ANON_KEY) {
        errors.push('SUPABASE_ANON_KEY is required when using Supabase');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export const config = env;
export default config;
