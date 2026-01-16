import { resumeContext, systemPrompt } from './chatbotContext';

/**
 * Chatbot Service - EVA Backend Integration
 */

const EVA_API_URL = import.meta.env.VITE_EVA_API_URL || 'http://localhost:8000/api/chat';
const USE_EVA_BACKEND = import.meta.env.VITE_USE_EVA_BACKEND === 'true';

export async function sendMessage(userMessage, conversationHistory = []) {
    if (USE_EVA_BACKEND) {
        try {
            let conversationId = sessionStorage.getItem('eva_conversation_id');
            const userName = sessionStorage.getItem('eva_user_name');
            const userCompany = sessionStorage.getItem('eva_user_company');

            // Get referral source from URL (e.g., ?ref=google)
            const urlParams = new URLSearchParams(window.location.search);
            const source = urlParams.get('ref') || 'General Visitor';

            const response = await fetch(EVA_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    conversation_id: conversationId || null,
                    metadata: {
                        source,
                        user_name: userName,
                        user_company: userCompany
                    }
                })
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

    // Using gemini-2.0-flash-lite-preview-02-05 on v1beta - Standard for 2026 efficient inference
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent';

    try {
        const context = buildFullContext();

        // Using official system_instruction for Gemini 1.5
        const systemInstruction = {
            role: 'system',
            parts: [{ text: `${systemPrompt}\n\nContext:\n${context}` }]
        };

        const contents = [];

        // Correctly alternating history
        conversationHistory.forEach(msg => {
            if (msg.role && msg.content) {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            }
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
                system_instruction: systemInstruction,
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 512,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error Body:', errorData);
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            const finishReason = data.candidates?.[0]?.finishReason;
            console.warn('Gemini Finish Reason:', finishReason, 'Data:', data);

            if (finishReason === 'RECITATION') return "ขออภัยครับ ข้อมูลนี้ติดลิขสิทธิ์หรือข้อจำกัดบางอย่าง (Recitation) โปรดถามคำถามอื่นแทนนะครับ";
            if (finishReason === 'SAFETY') return "ขออภัยครับ ข้อความนี้ถูกกรองโดยระบบความปลอดภัย (Safety) โปรดลองถามคำถามอื่นนะครับ";

            throw new Error(`Model returned empty output. (Reason: ${finishReason || 'Unknown'})`);
        }

    } catch (error) {
        console.error('Gemini Service Error:', error);
        throw error;
    }
}

function buildFullContext() {
    const ctx = resumeContext;
    return `Boss: ${ctx.personalInfo.name} (${ctx.personalInfo.nickname}), 32. ${ctx.personalInfo.description}. Location: ${ctx.personalInfo.location}.`;
}
