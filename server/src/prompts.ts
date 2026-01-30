/**
 * AI Prompt Library
 * Centralized linguistic constraints and system instructions
 */

export const LINGUISTIC_CONSTRAINTS: Record<string, string> = {
  'A1': 'STRICT A1: Use only the most common 500 words. Subject-Verb-Object sentences only. Present tense only. No idioms.',
  'A2': 'STRICT A2: Use core 1000 words. Simple past and future allowed. Short compound sentences.',
  'B1': 'STRICT B1: Intermediate vocabulary. Relative clauses and modal verbs allowed. Basic common idioms.',
  'B2': 'STRICT B2: Advanced vocabulary. Complex tenses (Perfect). Professional idioms and nuances.',
  'C1': 'STRICT C1: Academic and sophisticated vocabulary. Subtle nuances and complex native-like structures.',
  'C2': 'STRICT C2: Mastery level. No restrictions but maintain a professional coaching tone.'
};

export const CHAT_SYSTEM_RULES = `
CRITICAL RULES FOR AI:
1. **Clinical Accuracy**: You MUST NOT use vocabulary or grammar above the learner's specific level.
2. **Coach Mode**:
   - Correct major errors in parentheses: "I was go (I went) to the park."
   - Keep explanations in simple Arabic if the user is A1-B1.
3. **Engagement**: End with ONE simple follow-up question.
4. **Tone**: Encourage the student; be patient.
5. **Conciseness**: Keep responses to 1-3 sentences.
`;

export const LESSON_GEN_PROMPT = (level: string, category: string) => `
Generate a high-quality English learning lesson for level ${level} in the category of "${category}".
The lesson should contain exactly 8 sentences.
Each sentence MUST be strictly appropriate for the CEFR level ${level}.
Provide the output strictly as a JSON object with this structure:
{
  "id": "gen-${Date.now()}",
  "title": "A catchy title in English",
  "description": "Short description in English",
  "level": "${level}",
  "category": "${category}",
  "estimatedMinutes": 15,
  "sentences": [
    {
      "id": "s1",
      "text": "The English sentence",
      "translation": "Professional Arabic translation (العالَمية)",
      "explanation": "Brief tip or grammar point in Arabic",
      "phonetic": "Simple phonetic guide"
    }
  ]
}

CRITICAL: 
- For A1/A2: Use simple words, present tense, and daily scenarios.
- For B1/B2: Use more complex structures, some idioms, and varied tenses.
- For C1/C2: Use academic vocabulary, nuance, and advanced idioms.
- Final output must be valid JSON only, no markdown formatting.
`;

export const GRAMMAR_ANALYZE_PROMPT = (text: string) => `
Analyze the following English text for grammar, spelling, and style errors.
Provide the output strictly as a JSON array of error objects.
If there are no errors, return an empty array [].

Text to analyze: "${text}"

Output format:
[
  {
    "type": "grammar" | "spelling" | "style",
    "original": "substring with error",
    "correction": "corrected substring",
    "explanation": "concise explanation of the rule"
  }
]
`;

export const PRONUNCIATION_ANALYZE_PROMPT = (expected: string, text: string) => `
Analyze the pronunciation of this English learner.
Target Sentence: "${expected}"
Learner's Attempt: "${text}"

Provide a professional, clinical linguistic analysis in JSON format:
{
  "overallScore": number (0-100),
  "overallFeedback": "Professional summary in Arabic",
  "aiTip": "Clinical tip in Arabic about tongue placement or stress",
  "wordBreakdown": [
    { "word": "word", "status": "perfect" | "good" | "needs-work" | "error", "phoneticHelp": "IPA or simple guide", "feedback": "brief feedback" }
  ]
}
`;

export const SCENARIO_GEN_PROMPT = (level: string) => `
Generate 4 unique, highly engaging English conversation scenarios for level ${level}.
Each scenario should be a practical, real-life situation.
Provide the output strictly as a JSON array of objects with this structure:
[
  {
    "id": "scenario-unique-id",
    "title": "Title in English",
    "description": "Short description in English",
    "role": "Role of the AI (e.g., 'A barista at a coffee shop')",
    "level": "${level}",
    "category": "One of: Social, Travel, Business, Academic, Health",
    "icon": "One of: MessageCircle, Plane, Briefcase, UtensilsCrossed, Users, Stethoscope"
  }
]

CRITICAL:
- Level ${level} appropriateness is mandatory.
- Use variety in categories.
- Final output must be valid JSON only.
`;

export const TRANSLATE_PROMPT = (text: string, targetLang: string = 'Arabic') => `
Translate the following English text to ${targetLang}.
Provide ONLY the translation itself. Do not include any headers, explanations, or quotes.
If context allows, use a professional coaching tone (العالَمية).

Text to translate: "${text}"
`;

export const CONVERSATION_SUMMARY_PROMPT = (history: any[]) => `
Analyze the following conversation between a student and an AI tutor.
Provide a concise, professional linguistic summary in a coaching tone.
Focus on accuracy, range, and communicative effectiveness.

Provide the output strictly as a JSON object:
{
  "summary": "Brief encouraging summary (max 3 sentences)",
  "strengths": ["list of 2-3 key linguistic strengths"],
  "weaknesses": ["list of 2-3 specific grammatical or lexical areas to improve"],
  "nextSteps": ["3 actionable learning tasks"],
  "overallGrade": "CEFR Level shown in this session (e.g. A2+ or B1-)"
}

Conversation History:
${JSON.stringify(history)}
`;
