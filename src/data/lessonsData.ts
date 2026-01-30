
export interface Sentence {
    id: string;
    text: string;
    translation: string;
    explanation?: string;
    phonetic?: string;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    category: string;
    sentences: Sentence[];
    estimatedMinutes: number;
    isLocked?: boolean;
}

// Core Seed Lessons (Hand-crafted for quality)
export const lessons: Lesson[] = [
    {
        id: 'a1-1',
        title: 'Greetings & Introductions',
        description: 'Master the basics of meeting people professionally.',
        level: 'A1',
        category: 'Social',
        estimatedMinutes: 10,
        sentences: [
            { id: 's1', text: 'Hello, how are you today?', translation: 'مرحباً، كيف حالك اليوم؟', explanation: 'A friendly opening greeting.' },
            { id: 's2', text: 'My name is Alex and I am from London.', translation: 'اسمي أليكس وأنا من لندن.', explanation: 'How to introduce yourself.' }
        ]
    },
    {
        id: 'b1-1',
        title: 'Professional Communication',
        description: 'Advanced phrases for workplace interaction.',
        level: 'B1',
        category: 'Business',
        estimatedMinutes: 15,
        sentences: [
            { id: 's1', text: 'I would like to discuss the project timeline.', translation: 'أود مناقشة الجدول الزمني للمشروع.', explanation: 'Professional request.' },
            { id: 's2', text: 'Could you please provide some feedback on this draft?', translation: 'هل يمكنك تقديم بعض الملاحظات على هذه المسودة؟' }
        ]
    },
    {
        id: 'c1-1',
        title: 'Abstract Reasoning & Logic',
        description: 'Nuanced expressions for complex discussions.',
        level: 'C1',
        category: 'Science',
        estimatedMinutes: 20,
        sentences: [
            { id: 's1', text: 'The empirical evidence suggests a correlation between these variables.', translation: 'تشير الأدلة التجريبية إلى وجود علاقة بين هذه المتغيرات.', explanation: 'Scientific observation.' }
        ]
    }
];

export const allLessons = [...lessons];
