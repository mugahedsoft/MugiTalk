// Core domain types and interfaces for MugiTalk platform
// Following DDD principles with clear separation of concerns

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  level: UserLevel;
  targetLevel?: UserLevel;
  nativeLanguage: string;
  learningLanguage: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserProgress {
  userId: string;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  pronunciationAccuracy: number; // Average percentage
  level: UserLevel;
  lastPracticeDate?: Date;
  weeklyGoal: number; // Minutes per week
  weeklyProgress: number; // Minutes completed this week
}

// ============================================================================
// Learning Content Types
// ============================================================================

export type TopicCategory =
  | 'daily-life'
  | 'travel'
  | 'business'
  | 'food'
  | 'education'
  | 'health'
  | 'technology'
  | 'entertainment'
  | 'relationships'
  | 'emergency';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: UserLevel;
  category: TopicCategory;
  estimatedMinutes: number;
  order: number;
  sentences: Sentence[];
  vocabularyWords: VocabularyWord[];
  isLocked: boolean;
  prerequisiteLessonIds?: string[];
}

export interface Sentence {
  id: string;
  text: string;
  translation: string; // In user's native language
  audioUrl?: string; // TTS generated
  phonetic?: string;
  explanation?: string;
  grammarPoints?: string[];
  difficulty: number; // 1-5
}

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
  exampleSentence: string;
  exampleTranslation: string;
  audioUrl?: string;
  imageUrl?: string;
}

// ============================================================================
// Exercise & Practice Types
// ============================================================================

export type ExerciseType =
  | 'speaking'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'vocabulary'
  | 'conversation';

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  question: string;
  correctAnswer?: string;
  options?: string[]; // For multiple choice
  hints?: string[];
  points: number;
}

export interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number; // 0-100
  timeSpentSeconds: number;
  feedback?: string;
  attemptedAt: Date;
}

// ============================================================================
// Speech Recognition & Pronunciation Types
// ============================================================================

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number; // 0-1
  words: WordRecognition[];
  overallScore: number; // 0-100
}

export interface WordRecognition {
  word: string;
  expectedWord?: string;
  isCorrect?: boolean;
  accuracy: number; // 0-100
  feedback?: string;
  phoneticHelp?: string;
  status: 'perfect' | 'good' | 'needs-work' | 'incorrect';
}

export interface PronunciationFeedback {
  overallScore: number;
  overallFeedback?: string;
  wordBreakdown: WordRecognition[];
  strengths?: string[];
  improvements?: string[];
  aiTip?: string;
}

// ============================================================================
// AI Conversation Types
// ============================================================================

export type ConversationScenario =
  | 'job-interview'
  | 'restaurant'
  | 'airport'
  | 'shopping'
  | 'doctor'
  | 'small-talk'
  | 'negotiation'
  | 'presentation';

export interface Conversation {
  id: string;
  userId: string;
  scenario: ConversationScenario;
  level: UserLevel;
  characterName: string;
  characterRole: string;
  messages: ConversationMessage[];
  startedAt: Date;
  endedAt?: Date;
  rating?: number; // User's rating 1-5
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  corrections?: GrammarCorrection[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  errorType: 'grammar' | 'vocabulary' | 'pronunciation' | 'style';
}

// ============================================================================
// Gamification & Achievements Types
// ============================================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  category: 'streak' | 'lessons' | 'accuracy' | 'conversation' | 'special';
  requirement: number;
  rewardXP: number;
  isSecret?: boolean;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number; // 0-100
}

export interface DailyGoal {
  userId: string;
  date: Date;
  targetMinutes: number;
  completedMinutes: number;
  isCompleted: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
  gemini: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  speech: {
    language: string;
    continuous: boolean;
    interimResults: boolean;
  };
  tts: {
    voice: string;
    rate: number;
    pitch: number;
  };
  features: {
    enableAIChat: boolean;
    enableSpeechRecognition: boolean;
    enableOfflineMode: boolean;
  };
}

// ============================================================================
// Local Storage Types (for offline-first approach)
// ============================================================================

export interface LocalUserData {
  user: User;
  progress: UserProgress;
  completedLessons: string[];
  achievements: UserAchievement[];
  lastSync: Date;
}
