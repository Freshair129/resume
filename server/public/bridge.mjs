import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { createPublicProxy } from './proxy.mjs';
import { createLineWebhookProxy } from './line-webhook.mjs';

export function createBridgeServer(options) {
  const proxy = createPublicProxy({ ...options, localOrigin: true, requireToken: true });
  const line = createLineWebhookProxy(options);
  const server = createServer(async (req, res) => {
    try {
      const disconnect=new AbortController();
      req.once('aborted',()=>disconnect.abort());
      res.once('close',()=>{if(!res.writableEnded)disconnect.abort();});
      const url = new URL(req.url, 'http://bridge.local');
      if (url.origin !== 'http://bridge.local') { res.writeHead(400); res.end(); return; }
      const request = new Request(url, { method: req.method, headers: req.headers, signal:disconnect.signal, ...(!['GET', 'HEAD'].includes(req.method) ? { body: Readable.toWeb(req), duplex: 'half' } : {}) });
      const response = await (url.pathname === '/api/webhooks/line' && req.method === 'POST' ? line : proxy)(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch { res.writeHead(503, { 'Cache-Control': 'no-store' }); res.end(); }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  server.maxHeadersCount = 40;
  return server;
}
