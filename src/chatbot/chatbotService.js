/**
 * Chatbot Service
 *
 * 1. EVA backend (optional) — used only when VITE_USE_EVA_BACKEND=true and a URL is set.
 * 2. /api/chat — Vercel Function that holds the Gemini key server-side (see api/chat.js).
 *
 * The browser never sees an API key.
 */
import { getConversationId, getSource, getVisitorId, isDoNotTrackEnabled } from '../lib/visitor';

const EVA_API_URL = import.meta.env.VITE_EVA_API_URL || '';
const USE_EVA_BACKEND = import.meta.env.VITE_USE_EVA_BACKEND === 'true' && Boolean(EVA_API_URL);
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat';

const FALLBACK_BY_REASON = {
    RECITATION: 'ขออภัยครับ ข้อมูลนี้ติดข้อจำกัดด้านลิขสิทธิ์ โปรดถามคำถามอื่นแทนนะครับ',
    SAFETY: 'ขออภัยครับ ข้อความนี้ถูกกรองโดยระบบความปลอดภัย โปรดลองถามคำถามอื่นนะครับ',
};

export async function sendMessage(userMessage, conversationHistory = [], identity = {}) {
    if (USE_EVA_BACKEND) {
        try {
            const reply = await sendMessageEva(userMessage);
            if (reply) return reply;
        } catch (error) {
            console.error('EVA API error, falling back to /api/chat:', error);
        }
    }

    return sendMessageServer(userMessage, conversationHistory, identity);
}

async function sendMessageEva(userMessage) {
    const conversationId = sessionStorage.getItem('eva_conversation_id');
    const userName = sessionStorage.getItem('eva_user_name');
    const userCompany = sessionStorage.getItem('eva_user_company');
    const source = new URLSearchParams(window.location.search).get('ref') || 'General Visitor';

    const response = await fetch(EVA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: userMessage,
            conversation_id: conversationId || null,
            metadata: { source, user_name: userName, user_company: userCompany },
        }),
    });
    if (!response.ok) throw new Error(`EVA API request failed: ${response.status}`);

    const data = await response.json();
    if (data.conversation_id) sessionStorage.setItem('eva_conversation_id', data.conversation_id);
    return data.response;
}

async function sendMessageServer(userMessage, conversationHistory, identity) {
    const history = conversationHistory
        .filter((msg) => msg?.role && msg?.content)
        .map((msg) => ({ role: msg.role === 'user' ? 'user' : 'model', content: msg.content }));

    const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: userMessage,
            history,
            visitor: {
                id: getVisitorId(),
                name: identity?.name || null,
                company: identity?.company || null,
                source: getSource(),
                language: identity?.language === 'en' ? 'en' : 'th',
            },
            conversationId: getConversationId(),
            dnt: isDoNotTrackEnabled(),
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || `Chat API error: ${response.status}`);
    }

    if (data.response) return data.response;
    return FALLBACK_BY_REASON[data.reason] || 'ขออภัยครับ ตอบไม่ได้ในตอนนี้ ลองถามใหม่อีกครั้งนะครับ';
}
