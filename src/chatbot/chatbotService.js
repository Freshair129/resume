export async function sendMessage(message) {
  const response = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }), signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('EVA is temporarily unavailable. Browse /projects for approved sources.');
  const data = await response.json();
  return [data.answer, ...(data.citations || []).map(c => `${c.title}: ${c.url}`)].join('\n\n');
}
