import { resumeContext, systemPrompt } from './chatbotContext';

/**
 * Chatbot Service - EVA Backend Integration
 */

const EVA_API_URL = import.meta.env.VITE_EVA_API_URL || 'http://localhost:8000/api/chat';
const USE_EVA_BACKEND = import.meta.env.VITE_USE_EVA_BACKEND === 'true';

export async function sendMessage(userMessage, conversationHistory = []) {
    if (USE_EVA_BACKEND) {
        try {
            const conversationId = sessionStorage.getItem('eva_conversation_id');
            const response = await fetch(EVA_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, conversation_id: conversationId || null })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.conversation_id) sessionStorage.setItem('eva_conversation_id', data.conversation_id);
                return data.response;
            }
        } catch (error) {
            console.error('EVA API error, falling back to Gemini:', error);
        }
    }

    return await sendMessageGemini(userMessage, conversationHistory);
}

async function sendMessageGemini(userMessage, conversationHistory = []) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key missing');

    // Using v1 for gemini-3-flash which appeared in user rate limits
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent';

    try {
        const fullPrompt = `${systemPrompt}\n\nContext:\n${buildFullContext()}`;

        const contents = [
            {
                role: 'user',
                parts: [{ text: fullPrompt }]
            },
            {
                role: 'model',
                parts: [{ text: "Understood. I will act as Boss's assistant." }]
            }
        ];

        // History
        conversationHistory.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        // Current message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
            })
        });

        if (!response.ok) {
            const errorDetail = await response.text();
            console.error('Gemini API Error Detail:', errorDetail);
            throw new Error(`Gemini API failed with status ${response.status}`);
        }

        const data = await response.json();

        // Check for safety blocks or empty output
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            console.warn('Potential blocked response:', data);
            throw new Error('Empty response from Gemini 3.0 (Check safety filters)');
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Gemini Service Error:', error);
        throw error;
    }
}

function buildFullContext() {
    const ctx = resumeContext;
    return `Boss: ${ctx.personalInfo.name} (${ctx.personalInfo.nickname}), 32. ${ctx.personalInfo.description}. Location: ${ctx.personalInfo.location}.`;
}
