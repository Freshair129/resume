import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const timeoutMs = 15_000;
const maxResponseBytes = 1024 * 1024;
const slug = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const definitions = [
  ['search_portfolio', 'Search approved public portfolio evidence.', z.object({ query: z.string().trim().min(1).max(2000) }).strict()],
  ['get_project', 'Read one published project and its approved evidence.', z.object({ slug }).strict()],
  ['get_evidence', 'Read an approved public evidence record by UUID.', z.object({ id: z.uuid() }).strict()],
  ['list_public_projects', 'List currently published portfolio projects.', z.object({}).strict()],
  ['get_resume_profile', 'Read an approved public resume profile for one language and track.', z.object({ lang: z.enum(['th', 'en']).default('en'), track: slug.default('ai-automation') }).strict()],
  ['suggest_case_study_gaps', 'Report evidence gaps visible in a published case study; does not read private review records.', z.object({ slug }).strict()],
];

const errors = {
  KNOWLEDGE_API_UNAUTHORIZED: 'The public-read API credential was rejected.',
  KNOWLEDGE_API_NOT_FOUND: 'No approved public record is available.',
  KNOWLEDGE_API_RATE_LIMITED: 'The service rate limit was reached. Try again later.',
  KNOWLEDGE_API_UNAVAILABLE: 'The Knowledge API is unavailable.',
  KNOWLEDGE_API_TIMEOUT: 'The Knowledge API request timed out.',
  KNOWLEDGE_API_INVALID_RESPONSE: 'The Knowledge API returned an invalid response.',
};

function failure(code) {
  return Object.assign(new Error(code), { code });
}

function jsonResult(data, isError = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data) }],
    structuredContent: data,
    ...(isError ? { isError: true } : {}),
  };
}

function validateConfig(url, token, fetchImpl) {
  try {
    if (typeof url !== 'string' || typeof token !== 'string' || !token || /\s/.test(token) || typeof fetchImpl !== 'function') throw new Error();
    const parsed = new URL(url);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    if ((parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && loopback)) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error();
    return parsed.origin;
  } catch {
    // Never expose the supplied URL/token in configuration diagnostics.
    throw new Error('MCP_CONFIG_INVALID: configure an API origin and a public:read token.');
  }
}

async function readJson(response) {
  if (!/^application\/(?:[\w.+-]+\+)?json(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '')) throw failure('KNOWLEDGE_API_INVALID_RESPONSE');
  const advertisedSize = Number(response.headers.get('content-length'));
  if (advertisedSize > maxResponseBytes || !response.body) throw failure('KNOWLEDGE_API_INVALID_RESPONSE');
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxResponseBytes) {
        void reader.cancel().catch(() => {});
        throw failure('KNOWLEDGE_API_INVALID_RESPONSE');
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    if (error.code === 'KNOWLEDGE_API_INVALID_RESPONSE') throw error;
    throw failure('KNOWLEDGE_API_INVALID_RESPONSE');
  } finally {
    reader.releaseLock();
  }
}

/** Local stdio transport facade. PostgreSQL publication/ACL checks remain in the shared API. */
export function createMcpServer({ url, token, fetchImpl = globalThis.fetch } = {}) {
  const origin = validateConfig(url, token, fetchImpl);
  const server = new McpServer({ name: 'portfolio-knowledge', version: '1.0.0' }, { maxToolInputElements: 16 });

  async function request(name, args) {
    const controller = new AbortController();
    let timer;
    try {
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(failure('KNOWLEDGE_API_TIMEOUT'));
          controller.abort();
        }, timeoutMs);
      });
      const operation = async () => {
        const response = await fetchImpl(`${origin}/api/mcp/${name}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(args),
          redirect: 'error',
          signal: controller.signal,
        });
        if (!response.ok) {
          void response.body?.cancel().catch(() => {});
          if (response.status === 401 || response.status === 403) throw failure('KNOWLEDGE_API_UNAUTHORIZED');
          if (response.status === 404) throw failure('KNOWLEDGE_API_NOT_FOUND');
          if (response.status === 429) throw failure('KNOWLEDGE_API_RATE_LIMITED');
          throw failure('KNOWLEDGE_API_UNAVAILABLE');
        }
        return readJson(response);
      };
      return jsonResult({ result: await Promise.race([operation(), deadline]) });
    } catch (error) {
      const code = Object.hasOwn(errors, error?.code) ? error.code : 'KNOWLEDGE_API_UNAVAILABLE';
      return jsonResult({ error: { code, message: errors[code] } }, true);
    } finally {
      clearTimeout(timer);
      controller.abort();
    }
  }

  for (const [name, description, inputSchema] of definitions) {
    server.registerTool(name, {
      description,
      inputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, args => request(name, args));
  }
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const server = createMcpServer({ url: process.env.KNOWLEDGE_API_URL, token: process.env.MCP_API_TOKEN });
    await server.connect(new StdioServerTransport());
  } catch {
    process.stderr.write('Portfolio MCP failed to start. Check API origin and public:read credential configuration.\n');
    process.exitCode = 1;
  }
}
