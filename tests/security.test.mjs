import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('browser chatbot has no provider credentials or direct provider fallback', () => {
  const code = readFileSync('src/chatbot/chatbotService.js', 'utf8');
  assert.doesNotMatch(code, /VITE_GEMINI_API_KEY|generativelanguage|chatbotContext/);
  assert.match(code, /api\/chat/);
});
