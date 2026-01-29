
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load env vars
dotenv.config({ path: '../.env' }); // Load from root .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.warn('⚠️ Warning: VITE_GEMINI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [], systemPrompt } = req.body;

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key not configured on server' });
        }

        // Construct chat history for Gemini
        // Note: Gemini SDK history format: { role: 'user' | 'model', parts: string | array }
        const chatHistory = history.map((msg: any) => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        let prompt = message;
        if (systemPrompt && history.length === 0) {
            // Enhanced System Prompt for Professional Coaching
            prompt = `
${systemPrompt}

CRITICAL RULES FOR AI:
1. **Match the Level**: You MUST restrict your vocabulary and grammar strictly to the learner's level (${req.body.level || 'A2'}).
   - A1/A2: Short sentences, basic words, present tense mostly.
   - B1/B2: Moderate complexity, some idioms, mixed tenses.
2. **Be a Coach, Not Just a Chatbot**:
   - If the user makes a mistake, ONLY correct it if it's significant.
   - Briefly explain the correction in parentheses, e.g., "I goed to store" -> "I went (past tense of go) to the store."
3. **Keep it Conversational**: Ask ONE relevant follow-up question to keep the practice going.
4. **Professionalism**: Be encouraging, patient, and polite at all times.

User: ${message}`;
        }

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error: any) {
        console.error('AI Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
});

// AI Analyze Endpoint (Grammar, Pronunciation feedback)
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, expected, type } = req.body;

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key not configured on server' });
        }

        let prompt = '';
        if (type === 'grammar') {
            prompt = `
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
        } else if (type === 'pronunciation') {
            prompt = `
Compare the spoken text with the expected text for pronunciation training.
Identify words that were likely mispronounced or missed based on the comparison.
Text said: "${text}"
Target text: "${expected}"

Output JSON format:
{
  "score": number (0-100),
  "feedback": "overall positive feedback",
  "words": [
    { "word": "word", "status": "correct" | "incorrect" | "missing", "tip": "optional tip" }
  ]
}
`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const resultText = response.text();

        // Clean markdown code blocks if present
        const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        res.json(data);

    } catch (error: any) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Backend server running at http://localhost:${port}`);
    console.log(`🔌 API Endpoints: /api/chat, /api/analyze`);
});
