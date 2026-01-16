/**
 * Chatbot Service - EVA Backend Integration
 * Connects to EVA 9.4.0 API instead of direct Gemini calls
 */

const EVA_API_URL = import.meta.env.VITE_EVA_API_URL || 'http://localhost:8000/api/chat';
const USE_EVA_BACKEND = import.meta.env.VITE_USE_EVA_BACKEND === 'true';

/**
 * Send a message to EVA Backend API
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Not used (EVA manages context internally)
 * @returns {Promise<string>} - The bot's response
 */
export async function sendMessage(userMessage, conversationHistory = []) {
    if (!USE_EVA_BACKEND) {
        // Fallback to Gemini if EVA backend is not enabled
        return await sendMessageGemini(userMessage, conversationHistory);
    }

    try {
        // Get stored conversation ID from session
        const conversationId = sessionStorage.getItem('eva_conversation_id');

        const response = await fetch(EVA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                conversation_id: conversationId || null
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('EVA API Error:', errorData);
            throw new Error(`EVA API request failed: ${response.status}`);
        }

        const data = await response.json();

        // Store conversation ID for session continuity
        if (data.conversation_id) {
            sessionStorage.setItem('eva_conversation_id', data.conversation_id);
        }

        return data.response;

    } catch (error) {
        console.error('Error connecting to EVA:', error);

        // Fallback to Gemini if EVA is unavailable
        if (import.meta.env.VITE_GEMINI_API_KEY) {
            console.log('Falling back to Gemini API...');
            return await sendMessageGemini(userMessage, conversationHistory);
        }

        throw error;
    }
}

/**
 * Original Gemini API implementation (fallback)
 */
async function sendMessageGemini(userMessage, conversationHistory = []) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('No API configuration available. Please configure either EVA backend or Gemini API key.');
    }

    // Using gemini-2.0-flash-exp (confirmed working - user has access)
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

    try {
        // Build simple context
        const contextSummary = buildSimpleContext();

        const contents = [
            {
                role: 'user',
                parts: [{ text: contextSummary }]
            },
            {
                role: 'model',
                parts: [{ text: 'Understood! I\'m ready to help visitors learn about Boss.' }]
            }
        ];

        conversationHistory.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated from API');
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Error in sendMessageGemini:', error);
        throw error;
    }
}

function buildSimpleContext() {
    return `You are Boss's AI assistant. Boss is Pornpon, 32, an Assistant Manager with experience in Production to Management. He's currently focused on AI Innovation. Be friendly, concise, and respond in the user's language (Thai or English).`;
}
