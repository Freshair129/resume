import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createBridgeServer } from '../server/public/bridge.mjs';
import { createPublicProxy, bridgeHeader } from '../server/public/proxy.mjs';

const token = 'synthetic-bridge-test-token-'.repeat(3);
async function start(server) {
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  return `http://127.0.0.1:${server.address().port}`;
}
async function stop(server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }

test('public bridge: actual HTTP denies credentials/admin paths and re-fetches canonical responses without caching', async () => {
  let published = true, calls = 0;
  const seen = [];
  const upstream = createServer((req, res) => {
    calls++; seen.push({ url: req.url, headers: req.headers });
    res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'private-session=must-not-forward', 'Cache-Control': 'public, max-age=3600' });
    res.end(JSON.stringify({ projects: published ? [{ slug: 'synthetic-fixture' }] : [] }));
  });
  const origin = await start(upstream), bridge = createBridgeServer({ origin, requiredToken: token });
  const base = await start(bridge);
  try {
    assert.equal((await fetch(base + '/api/portfolio')).status, 401);
    assert.equal((await fetch(base + '/api/portfolio', { headers: { [bridgeHeader]: 'wrong' } })).status, 401);
    for (const path of ['/api/admin/projects', '/api/internal/index-health', '/api/mcp/list_public_projects', '/api/webhooks/github', '/metrics', '/.env']) {
      assert.equal((await fetch(base + path, { headers: { [bridgeHeader]: token } })).status, 404);
    }
    assert.equal(calls, 0);
    const headers = { [bridgeHeader]: token, Authorization: 'Bearer never-forward-owner-credential', Cookie: 'private=never-forward', 'x-forwarded-host': 'attacker.invalid' };
    const first = await fetch(base + '/api/portfolio', { headers });
    assert.equal((await first.json()).projects.length, 1);
    assert.equal(first.headers.get('cache-control'), 'no-store');
    assert.equal(first.headers.get('vercel-cdn-cache-control'), 'no-store');
    assert.equal(first.headers.get('set-cookie'), null);
    published = false;
    assert.deepEqual(await (await fetch(base + '/api/portfolio', { headers })).json(), { projects: [] });
    assert.equal(calls, 2, 'Each retrieval reaches the canonical origin; no stale projection fallback.');
    for (const request of seen) for (const key of ['authorization', 'cookie', 'x-forwarded-host', bridgeHeader]) assert.equal(request.headers[key], undefined);
    await fetch(base + '/api/projects?category=data&route=admin&status=prototype&token=do-not-forward', { headers });
    assert.equal(seen.at(-1).url, '/api/projects?category=data&status=prototype');
  } finally { await stop(bridge); await stop(upstream); }
});

test('public proxy: bounded chat, methods, redirects, content type and outage fail closed', async () => {
  let calls = 0, mode = 'ok';
  const upstream = createServer(async (req, res) => {
    calls++;
    if (mode === 'redirect') { res.writeHead(302, { Location: 'https://example.invalid/' }); res.end(); return; }
    if (mode === 'html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<p>Proxy error</p>'); return; }
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ received: JSON.parse(Buffer.concat(chunks).toString() || '{}') }));
  });
  const origin = await start(upstream), bridge = createBridgeServer({ origin, requiredToken: token });
  const base = await start(bridge), headers = { [bridgeHeader]: token, 'Content-Type': 'application/json' };
  try {
    assert.equal((await fetch(base + '/api/projects', { method: 'POST', headers, body: '{}' })).status, 404);
    assert.equal((await fetch(base + '/api/chat', { method: 'POST', headers, body: JSON.stringify({ message: 'x'.repeat(20000) }) })).status, 400);
    assert.equal((await fetch(base + '/api/chat', { method: 'POST', headers, body: JSON.stringify({ message: 'hello', owner: true }) })).status, 400);
    assert.equal((await fetch(base + '/api/chat', { method: 'POST', headers: { [bridgeHeader]: token }, body: 'hello' })).status, 415);
    assert.equal(calls, 0);
    const response = await fetch(base + '/api/chat', { method: 'POST', headers, body: JSON.stringify({ message: 'Test public evidence', lang: 'en' }) });
    assert.deepEqual(await response.json(), { received: { message: 'Test public evidence', lang: 'en' } });
    mode = 'redirect'; assert.equal((await fetch(base + '/api/portfolio', { headers })).status, 502);
    mode = 'html'; assert.equal((await fetch(base + '/api/portfolio', { headers })).status, 502);
    await stop(upstream);
    assert.equal((await fetch(base + '/api/portfolio', { headers })).status, 503);
  } finally { await stop(bridge); if (upstream.listening) await stop(upstream); }
});

test('Vercel transport requires HTTPS and a dedicated token; no user headers cross the public hop', async () => {
  const request = new Request('https://portfolio.example/api/portfolio', { headers: { Authorization: 'Bearer client-token', Cookie: 'session=client', [bridgeHeader]: 'client-controlled' } });
  for (const options of [{}, { origin: 'http://localhost:3100', forwardToken: token }, { origin: 'https://api.example' }, { origin: 'https://user:password@api.example', forwardToken: token }]) {
    assert.equal((await createPublicProxy(options)(request)).status, 503);
  }
  let sent;
  const proxy = createPublicProxy({ origin: 'https://api.example', forwardToken: token, fetcher: async (url, options) => {
    sent = { url: url.href, options }; return Response.json({ projects: [] });
  } });
  assert.equal((await proxy(request)).status, 200);
  assert.equal(sent.url, 'https://api.example/api/portfolio');
  assert.equal(sent.options.headers[bridgeHeader], token);
  assert.equal(sent.options.headers.Authorization, undefined);
  assert.equal(sent.options.headers.Cookie, undefined);
  assert.equal(sent.options.redirect, 'manual');
  assert.equal(sent.options.cache, 'no-store');
});
