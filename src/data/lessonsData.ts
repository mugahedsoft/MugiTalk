
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

export const lessons: Lesson[] = [
    {
        id: 'a1-1',
        title: 'Greetings and Introductions',
        description: 'Learn how to greet people and introduce yourself in common situations.',
        level: 'A1',
        category: 'Daily Life',
        estimatedMinutes: 10,
        sentences: [
            { id: 's1', text: 'Hello, how are you today?', translation: 'مرحباً، كيف حالك اليوم؟', explanation: 'A friendly opening greeting.' },
            { id: 's2', text: 'My name is Alex and I am from London.', translation: 'اسمي أليكس وأنا من لندن.', explanation: 'How to introduce yourself.' },
            { id: 's3', text: 'Nice to meet you, I am a student.', translation: 'سررت بلقائك، أنا طالب.', explanation: 'Polite response upon meeting.' },
            { id: 's4', text: 'What is your name?', translation: 'ما اسمك؟' },
            { id: 's5', text: 'Where do you live?', translation: 'أين تعيش؟' },
            { id: 's6', text: 'I live in a small apartment downtown.', translation: 'أعيش في شقة صغيرة وسط المدينة.' },
            { id: 's7', text: 'How old are you?', translation: 'كم عمرك؟' },
            { id: 's8', text: 'I am twenty-five years old.', translation: 'عمري خمسة وعشرون عاماً.' },
            { id: 's9', text: 'What do you do for a living?', translation: 'ماذا تعمل لكسب عيشك؟' },
            { id: 's10', text: 'I work as a software engineer.', translation: 'أعمل كمهندس برمجيات.' }
        ]
    },
    {
        id: 'a1-2',
        title: 'At the Restaurant',
        description: 'Essential phrases for ordering food and interacting with servers.',
        level: 'A1',
        category: 'Travel',
        estimatedMinutes: 12,
        sentences: [
            { id: 'rs1', text: 'Could I see the menu, please?', translation: 'هل يمكنني رؤية القائمة من فضلك؟' },
            { id: 'rs2', text: 'I would like to order a coffee.', translation: 'أود طلب القهوة.' },
            { id: 'rs3', text: 'Is there a table for two?', translation: 'هل توجد طاولة لشخصين؟' },
            { id: 'rs4', text: 'How much does this cost?', translation: 'كم تكلفة هذا؟' },
            { id: 'rs5', text: 'The food was delicious, thank you.', translation: 'كان الطعام لذيذاً، شكراً لك.' },
            { id: 'rs6', text: 'Can I have the check, please?', translation: 'هل يمكنني الحصول على الفاتورة من فضلك؟' },
            { id: 'rs7', text: 'I am allergic to peanuts.', translation: 'لدي حساسية من الفول السوداني.' },
            { id: 'rs8', text: 'Where is the restroom?', translation: 'أين يقع الحمام؟' },
            { id: 'rs9', text: 'Do you accept credit cards?', translation: 'هل تقبلون بطاقات الائتمان؟' },
            { id: 'rs10', text: 'I will have the pasta, please.', translation: 'سأتناول الباستا من فضلك.' }
        ]
    }
];

export const generateMoreLessons = (count: number): Lesson[] => {
    const levels: Lesson['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const categories = ['Daily Life', 'Travel', 'Business', 'Technology', 'Science', 'Art'];
    const extraLessons: Lesson[] = [];

    for (let i = 0; i < count; i++) {
        const level = levels[i % levels.length];
        const category = categories[i % categories.length];
        const sentences: Sentence[] = [];

        for (let j = 0; j < 10; j++) {
            sentences.push({
                id: `gen-${i}-${j}`,
                text: `${category} sentence sample ${i}-${j} for level ${level}.`,
                translation: `ترجمة الجملة ${i}-${j} للمستوى ${level}.`,
                explanation: `Context: General practice for ${category}.`
            });
        }

        extraLessons.push({
            id: `gen-${i}`,
            title: `${category} Module ${i + 1}`,
            description: `Auto-generated high-efficiency practice for ${level} students.`,
            level,
            category,
            sentences,
            estimatedMinutes: 15
        });
    }
    return extraLessons;
};

export const allLessons = [...lessons, ...generateMoreLessons(300)];
