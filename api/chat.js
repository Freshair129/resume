// Vercel Function: proxies chatbot requests to Gemini so the API key stays on the server.
// Web-standard handler signature (Request -> Response). The same module is served
// locally by the Vite dev middleware in vite.config.js.
import { resumeContext, systemPrompt } from '../src/chatbot/chatbotContext.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 20;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export function GET() {
  return json({ ok: true, model: MODEL, configured: Boolean(process.env.GEMINI_API_KEY) });
}

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'Chat is not configured on the server.' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) return json({ error: 'message is required.' }, 400);
  if (message.length > MAX_MESSAGE_CHARS) return json({ error: 'message is too long.' }, 413);

  const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY_TURNS) : [];
  const contents = [];
  for (const turn of history) {
    if (!turn || typeof turn.content !== 'string' || !turn.content.trim()) continue;
    contents.push({
      role: turn.role === 'user' ? 'user' : 'model',
      parts: [{ text: turn.content.slice(0, MAX_MESSAGE_CHARS) }],
    });
  }
  // Gemini requires the first turn to come from the user.
  while (contents.length && contents[0].role !== 'user') contents.shift();
  contents.push({ role: 'user', parts: [{ text: message }] });

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: `${systemPrompt}\n\nContext:\n${JSON.stringify(resumeContext)}` }],
        },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    },
  );

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('Gemini upstream error', upstream.status, detail.slice(0, 500));
    return json({ error: 'The assistant is unavailable right now.' }, 502);
  }

  const data = await upstream.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join('');
  if (text) return json({ response: text });

  const reason = candidate?.finishReason || data.promptFeedback?.blockReason || 'EMPTY';
  return json({ response: null, reason });
}
