// GemiTalk Backend v1.2 - Hardened Edition
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import * as Prompts from './prompts';

// Load env vars from root
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Security Middleware ---
app.use(helmet()); // Protection against common web vulnerabilities
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- Rate Limiting (Hardening) ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to all /api routes
app.use('/api', limiter);

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- AI Initialization ---
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ CRITICAL ERROR: VITE_GEMINI_API_KEY is missing.');
}
const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', api: 'GemiTalk Hardened Core v1.2' });
});

// --- AI Chat Endpoint ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [], systemPrompt, level = 'A2' } = req.body;

        if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

        const chatHistory = history.map((msg: any) => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
        });

        let prompt = message;
        if (systemPrompt && history.length === 0) {
            const constraint = Prompts.LINGUISTIC_CONSTRAINTS[level] || Prompts.LINGUISTIC_CONSTRAINTS['A2'];
            prompt = `
${systemPrompt}
LINGUISTIC CONSTRAINT: ${constraint}
${Prompts.CHAT_SYSTEM_RULES}
Current Message: ${message}`;
        }

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        res.json({ response: response.text() });

    } catch (error: any) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: error.message || 'AI processing failed' });
    }
});

// --- AI Lesson Generation Endpoint ---
app.post('/api/lessons/generate', async (req, res) => {
    try {
        const { level = 'A2', category = 'Daily Life' } = req.body;
        if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

        const prompt = Prompts.LESSON_GEN_PROMPT(level, category);
        const result = await model.generateContent(prompt);
        const response = await result.response;

        const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(jsonStr));

    } catch (error: any) {
        console.error('Lesson Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate dynamic lesson' });
    }
});

// --- AI Scenario Generation Endpoint ---
app.post('/api/scenarios/generate', async (req, res) => {
    try {
        const { level = 'A2' } = req.body;
        if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

        const prompt = Prompts.SCENARIO_GEN_PROMPT(level);
        const result = await model.generateContent(prompt);
        const response = await result.response;

        const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(jsonStr));

    } catch (error: any) {
        console.error('Scenario Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate dynamic scenarios' });
    }
});

// --- AI Translation Endpoint ---
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang = 'Arabic' } = req.body;
        if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

        const prompt = Prompts.TRANSLATE_PROMPT(text, targetLang);
        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.json({ translatedText: response.text().trim() });

    } catch (error: any) {
        console.error('Translation Error:', error);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

// --- AI Conversation Summary Endpoint ---
app.post('/api/conversation/summary', async (req, res) => {
    try {
        const { history } = req.body;
        if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

        const prompt = Prompts.CONVERSATION_SUMMARY_PROMPT(history);
        const result = await model.generateContent(prompt);
        const response = await result.response;

        const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(jsonStr));

    } catch (error: any) {
        console.error('Summary Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate conversation summary' });
    }
});

// --- AI Analyze Endpoint ---
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, expected, type } = req.body;
        if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

        let prompt = type === 'grammar'
            ? Prompts.GRAMMAR_ANALYZE_PROMPT(text)
            : Prompts.PRONUNCIATION_ANALYZE_PROMPT(expected, text);

        const result = await model.generateContent(prompt);
        const response = await result.response;

        const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(jsonStr));

    } catch (error: any) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: 'AI Analysis failed' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Hardened Backend running at http://localhost:${port}`);
});
