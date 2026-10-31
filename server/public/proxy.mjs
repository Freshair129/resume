import { createHash, timingSafeEqual } from 'node:crypto';

export const bridgeHeader = 'x-portfolio-bridge-token';
const noStore = { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (status, error) => Response.json({ error }, { status, headers: noStore });
const reads = /^\/api\/(?:portfolio|profile|projects(?:\/[a-z0-9-]{1,80})?|health|ready|resume\/(?:ai-automation|martech|product-operations|content-coordinator|performance-marketer|synnex-pm)\/(?:th|en)\.pdf)$/;

export function publicRequestAllowed(path, method) {
  return ((method === 'GET' || method === 'HEAD') && reads.test(path)) || (method === 'POST' && ['/api/chat','/api/voice/transcribe','/api/voice/reply'].includes(path));
}

function tokenMatches(actual, expected) {
  if (!expected || expected.length < 32 || !actual) return false;
  return timingSafeEqual(createHash('sha256').update(actual).digest(), createHash('sha256').update(expected).digest());
}

export async function boundedBytes(stream, maximum) {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader(), chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maximum) { await reader.cancel(); throw new Error('SIZE_LIMIT'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, length);
}

// This is a restricted transport, never a second knowledge store or search engine.
export function createPublicProxy({ origin, forwardToken, requiredToken, requireToken = false, localOrigin = false, fetcher = fetch, timeoutMs = 25000 } = {}) {
  return async request => {
    const url = new URL(request.url);
    if (!publicRequestAllowed(url.pathname, request.method)) return json(404, 'NOT_FOUND');
    if (requireToken && !tokenMatches(request.headers.get(bridgeHeader), requiredToken)) return json(401, 'UNAUTHORIZED');
    let target;
    try {
      target = new URL(origin);
      if ((!localOrigin && target.protocol !== 'https:') || !['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.pathname !== '/' || target.search || target.hash) throw new Error('INVALID_ORIGIN');
      if (!localOrigin && (!forwardToken || forwardToken.length < 32)) throw new Error('MISSING_TOKEN');
    } catch { return json(503, 'KNOWLEDGE_ORIGIN_NOT_CONFIGURED'); }
    target.pathname = url.pathname;
    // Only public list filters cross the bridge. Routing/control parameters do not.
    if (url.pathname === '/api/projects') for (const key of ['category', 'status']) {
      const value = url.searchParams.get(key);
      if (value && value.length <= 100) target.searchParams.set(key, value);
    }
    const voiceInput=url.pathname==='/api/voice/transcribe';
    if(voiceInput){
      if([...url.searchParams.keys()].length!==1||!['th','en'].includes(url.searchParams.get('lang')))return json(400,'INVALID_LANGUAGE');
      target.searchParams.set('lang',url.searchParams.get('lang'));
    }
    const headers = { Accept: 'application/json, application/pdf' };
    if (forwardToken) headers[bridgeHeader] = forwardToken;
    let body;
    if (request.method === 'POST') {
     if(voiceInput){
      if(request.headers.get('content-encoding')||!/^audio\/wav(?:;|$)/i.test(request.headers.get('content-type')||''))return json(415,'WAV_REQUIRED');
      try{body=await boundedBytes(request.body,512*1024);if(!body.length)return json(400,'INVALID_AUDIO');headers['Content-Type']='audio/wav';}catch{return json(400,'INVALID_AUDIO');}
     }else{
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json(415, 'JSON_REQUIRED');
      try {
        const value = JSON.parse(Buffer.from(await boundedBytes(request.body, 16384)).toString('utf8'));
        if (!value || typeof value.message !== 'string' || !value.message.trim() || value.message.length > 2000 || (value.lang !== undefined && !['th', 'en'].includes(value.lang)) || Object.keys(value).some(key => !['message', 'lang'].includes(key))) return json(400, 'INVALID_REQUEST');
        body = JSON.stringify(value); headers['Content-Type'] = 'application/json';
      } catch { return json(400, 'INVALID_REQUEST'); }
     }
    }
    try {
      const response = await fetcher(target, { method: request.method, headers, body, redirect: 'manual', cache: 'no-store', signal: AbortSignal.any([request.signal,AbortSignal.timeout(timeoutMs)]) });
      // Never follow redirects carrying the bridge credential or emit upstream cookies.
      if (response.status >= 300 && response.status < 400) { await response.body?.cancel(); return json(502, 'UPSTREAM_UNAVAILABLE'); }
      const type = response.headers.get('content-type') || '';
      if (!/^(application\/json|application\/pdf)(?:;|$)/i.test(type)) { await response.body?.cancel(); return json(502, 'UPSTREAM_UNAVAILABLE'); }
      const bytes = await boundedBytes(response.body, 8 * 1024 * 1024);
      const responseHeaders = { ...noStore, 'Content-Type': type };
      if (type.startsWith('application/pdf')) responseHeaders['Content-Disposition'] = 'attachment; filename="portfolio-resume.pdf"';
      return new Response(request.method === 'HEAD' ? null : bytes, { status: response.status, headers: responseHeaders });
    } catch { return json(503, 'KNOWLEDGE_UNAVAILABLE'); }
  };
}
