
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error('API Key missing');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
    try {
        // There is no direct listModels in the client SDK like this usually, 
        // but we can try common names.
        // Actually, the easiest way to test is to try 'gemini-pro' which is the legacy but most stable name.
        console.log('Testing gemini-pro...');
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('hi');
        console.log('SUCCESS with gemini-pro:', result.response.text());
    } catch (e) {
        console.error('FAILED with gemini-pro:', e.message);
    }

    try {
        console.log('Testing gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('hi');
        console.log('SUCCESS with gemini-1.5-flash:', result.response.text());
    } catch (e) {
        console.error('FAILED with gemini-1.5-flash:', e.message);
    }
}

list();
