import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../server/adapters/mcp.mjs';

const token = 'fixture-public-read-token';
const names = ['search_portfolio', 'get_project', 'get_evidence', 'list_public_projects', 'get_resume_profile', 'suggest_case_study_gaps'];
const parse = result => JSON.parse(result.content[0].text);

async function connect(t, options) {
  const server = createMcpServer(options);
  const client = new Client({ name: 'portfolio-test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => { await client.close(); await server.close(); });
  return client;
}

test('MCP rejects missing auth and unsafe origins before accepting a connection', () => {
  for (const missing of [undefined, '', '  ', 'bad\r\ntoken']) {
    assert.throws(() => createMcpServer({ url: 'http://127.0.0.1:3001', token: missing }), /MCP_CONFIG_INVALID/);
  }
  for (const url of ['http://api.example.com', 'file:///tmp/api', 'https://user:password@example.com', 'https://example.com?token=secret', 'https://example.com/#secret', 'https://example.com/api']) {
    assert.throws(() => createMcpServer({ url, token }), /MCP_CONFIG_INVALID/);
  }
});

test('official MCP client lists six read-only tools and routes all calls to shared HTTP API', async t => {
  const calls = [];
  const http = createServer(async (req, res) => {
    let text = '';
    for await (const chunk of req) text += chunk;
    calls.push({ method: req.method, path: req.url, authorization: req.headers.authorization, body: JSON.parse(text) });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ published: true, fixture: 'transport-only', tool: req.url.split('/').at(-1) }));
  });
  await new Promise(resolve => http.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => http.close(resolve)));
  const client = await connect(t, { url: `http://127.0.0.1:${http.address().port}`, token });
  const listed = await client.listTools();
  assert.deepEqual(listed.tools.map(tool => tool.name), names);
  for (const tool of listed.tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
    assert.equal(tool.inputSchema.additionalProperties, false);
  }
  const argumentsByName = {
    search_portfolio: { query: 'ระบบ AI ที่มีหลักฐาน' },
    get_project: { slug: 'genesisblock' },
    get_evidence: { id: '87d691ba-6a01-4fb1-9888-d719c977dd42' },
    list_public_projects: {},
    get_resume_profile: {},
    suggest_case_study_gaps: { slug: 'fung' },
  };
  for (const name of names) {
    const result = await client.callTool({ name, arguments: argumentsByName[name] });
    assert.equal(result.isError, undefined);
    assert.equal(parse(result).result.tool, name);
    assert.deepEqual(result.structuredContent, parse(result));
  }
  assert.equal(calls.length, 6);
  for (const call of calls) {
    assert.equal(call.method, 'POST');
    assert.equal(call.authorization, `Bearer ${token}`);
    assert.match(call.path, /^\/api\/mcp\/[a-z_]+$/);
  }
  assert.deepEqual(calls[4].body, { lang: 'en', track: 'ai-automation' });
});

test('MCP input schemas block invalid arguments, private scope injection and write tool names', async t => {
  let calls = 0;
  const client = await connect(t, { url: 'https://knowledge.example.com', token, fetchImpl: async () => { calls++; return Response.json({}); } });
  const invalid = [
    { name: 'search_portfolio', arguments: { query: 'x'.repeat(2001) } },
    { name: 'search_portfolio', arguments: { query: '   ' } },
    { name: 'get_evidence', arguments: { id: 'not-a-uuid' } },
    { name: 'get_project', arguments: { slug: '../admin' } },
    { name: 'list_public_projects', arguments: { scope: 'owner', visibility: 'private' } },
    { name: 'get_resume_profile', arguments: { lang: 'fr' } },
    { name: 'publish_project', arguments: { slug: 'fung' } },
  ];
  for (const request of invalid) {
    const result = await client.callTool(request);
    assert.equal(result.isError, true);
  }
  assert.equal(calls, 0);
});

test('MCP forwards auth rejection without exposing upstream error bodies', async t => {
  const client = await connect(t, { url: 'https://knowledge.example.com', token, fetchImpl: async () => new Response(`private detail ${token}`, { status: 403 }) });
  const result = await client.callTool({ name: 'list_public_projects', arguments: {} });
  assert.equal(result.isError, true);
  assert.equal(parse(result).error.code, 'KNOWLEDGE_API_UNAUTHORIZED');
  assert.equal(JSON.stringify(result).includes(token), false);
  assert.equal(JSON.stringify(result).includes('private detail'), false);
});

test('MCP refuses redirects and bounds fetch time without returning network diagnostics', async t => {
  let options;
  const client = await connect(t, { url: 'https://knowledge.example.com', token, fetchImpl: async (_url, init) => {
    options = init;
    throw new Error(`network debug ${token}`);
  } });
  const result = await client.callTool({ name: 'search_portfolio', arguments: { query: 'proof' } });
  assert.equal(options.redirect, 'error');
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(options.signal.aborted, true);
  assert.equal(result.isError, true);
  assert.equal(parse(result).error.code, 'KNOWLEDGE_API_UNAVAILABLE');
  assert.equal(JSON.stringify(result).includes(token), false);
});

test('MCP rejects malformed or oversized upstream JSON safely', async t => {
  let response = new Response('not-json', { headers: { 'Content-Type': 'application/json' } });
  const client = await connect(t, { url: 'https://knowledge.example.com', token, fetchImpl: async () => response });
  assert.equal(parse(await client.callTool({ name: 'list_public_projects', arguments: {} })).error.code, 'KNOWLEDGE_API_INVALID_RESPONSE');
  response = new Response('x'.repeat(1024 * 1024 + 1), { headers: { 'Content-Type': 'application/json' } });
  assert.equal(parse(await client.callTool({ name: 'list_public_projects', arguments: {} })).error.code, 'KNOWLEDGE_API_INVALID_RESPONSE');
});

test('MCP deadline finishes a stuck provider within 20 seconds and aborts the request', { timeout: 21_000 }, async t => {
  let signal;
  const client = await connect(t, { url: 'https://knowledge.example.com', token, fetchImpl: async (_url, options) => {
    signal = options.signal;
    return new Promise(() => {});
  } });
  const start = performance.now();
  const result = await client.callTool({ name: 'list_public_projects', arguments: {} });
  assert.equal(parse(result).error.code, 'KNOWLEDGE_API_TIMEOUT');
  assert.equal(signal.aborted, true);
  assert.ok(performance.now() - start < 20_000);
});

test('stdio CLI speaks the MCP protocol and refuses missing credentials without stdout diagnostics', async t => {
  const path = fileURLToPath(new URL('../server/adapters/mcp.mjs', import.meta.url));
  const client = new Client({ name: 'stdio-smoke', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path],
    env: { KNOWLEDGE_API_URL: 'http://127.0.0.1:3001', MCP_API_TOKEN: token },
    stderr: 'pipe',
  });
  t.after(() => client.close());
  await client.connect(transport);
  assert.equal((await client.listTools()).tools.length, 6);
  const withoutToken = { ...process.env, KNOWLEDGE_API_URL: 'https://knowledge.example.com' };
  delete withoutToken.MCP_API_TOKEN;
  const denied = spawnSync(process.execPath, [path], { env: withoutToken, encoding: 'utf8', timeout: 10_000 });
  assert.equal(denied.status, 1);
  assert.equal(denied.stdout, '');
  assert.match(denied.stderr, /failed to start/);
  assert.equal(denied.stderr.includes(token), false);
});
