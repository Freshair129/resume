import { resumeContext, systemPrompt } from './chatbotContext';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Send a message to Gemini API and get a response
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Array of previous messages
 * @returns {Promise<string>} - The bot's response
 */
export async function sendMessage(userMessage, conversationHistory = []) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    try {
        // Build context from resume data
        const contextSummary = buildContextSummary();

        // Format conversation history for Gemini
        const contents = [
            {
                role: 'user',
                parts: [{ text: systemPrompt + '\n\n' + contextSummary }]
            },
            {
                role: 'model',
                parts: [{ text: 'Understood! I\'m ready to help visitors learn about Boss. I\'ll be friendly, concise, and respond in the same language as the user.' }]
            }
        ];

        // Add conversation history
        conversationHistory.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        // Add current message
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
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 200, // Keep responses concise
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated from API');
        }

        const botResponse = data.candidates[0].content.parts[0].text;
        return botResponse;

    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
}

/**
 * Build a concise context summary from resume data
 * @returns {string}
 */
function buildContextSummary() {
    const ctx = resumeContext;

    return `
Boss's Profile:
- ${ctx.personalInfo.name} (${ctx.personalInfo.nickname}), ${ctx.personalInfo.age} years old
- Role: ${ctx.personalInfo.currentRole}
- Location: ${ctx.personalInfo.location}

Recent Experience:
${ctx.experience.slice(0, 3).map(exp =>
        `- ${exp.title} at ${exp.company} (${exp.period})`
    ).join('\n')}

Key Skills:
- Core: ${ctx.skills.core.slice(0, 5).join(', ')}
- AI Tools: ${ctx.skills.aiTools.slice(0, 4).join(', ')}

Portfolio:
${Object.entries(ctx.portfolio.categories).map(([cat, count]) =>
        `- ${cat}: ${count} works`
    ).join('\n')}

Current Focus: ${ctx.currentFocus.description}

Contact: ${ctx.contact.github}
`.trim();
}
