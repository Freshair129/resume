import { resumeContext, systemPrompt } from './chatbotContext';

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
    if (USE_EVA_BACKEND) {
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

            if (response.ok) {
                const data = await response.json();
                if (data.conversation_id) {
                    sessionStorage.setItem('eva_conversation_id', data.conversation_id);
                }
                return data.response;
            }

            console.error('EVA API error, falling back to Gemini');
        } catch (error) {
            console.error('Error connecting to EVA, falling back to Gemini:', error);
        }
    }

    // Fallback or Direct Gemini
    return await sendMessageGemini(userMessage, conversationHistory);
}

/**
 * Original Gemini API implementation (fallback)
 * Refactored for Gemini 3.0 stability
 */
async function sendMessageGemini(userMessage, conversationHistory = []) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('No API configuration available. Please configure either EVA backend or Gemini API key.');
    }

    // Using gemini-3-flash (Public 2026 model - using v1beta for better schema support)
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent';

    try {
        const contextSummary = buildFullContext();

        const requestBody = {
            systemInstruction: {
                parts: [{ text: systemPrompt + '\n\n' + contextSummary }]
            },
            contents: [],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
            }
        };

        // Add history
        conversationHistory.forEach(msg => {
            requestBody.contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        // Add current message
        requestBody.contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error Detail:', errorText);
            throw new Error(`Gemini API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            console.error('Full API Data:', data);
            throw new Error('No response generated from API (Potential filter block or empty output)');
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Error in sendMessageGemini:', error);
        throw error;
    }
}

/**
 * Build a rich context summary for the model
 */
function buildFullContext() {
    const ctx = resumeContext;
    return `
Boss (Pornpon Thanasuwanthat) Profile:
- Age: ${ctx.personalInfo.age}
- Role: ${ctx.personalInfo.currentRole}
- Location: ${ctx.personalInfo.location}
- Description: ${ctx.personalInfo.description}

Work Experience:
${ctx.experience.map(exp => `- ${exp.title} @ ${exp.company} (${exp.period}): ${exp.responsibilities?.join(', ') || ''}`).join('\n')}

Technical Skills:
- Core: ${ctx.skills.core.join(', ')}
- AI & Innovation: ${ctx.skills.aiTools.join(', ')}
- Media Tools: ${ctx.skills.toolsMedia.join(', ')}

Portfolio Highlights:
${ctx.portfolio.highlights.join('\n')}

Current Focus: ${ctx.currentFocus.area} - ${ctx.currentFocus.description}
`.trim();
}
