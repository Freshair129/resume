import { createPublicProxy } from '../server/public/proxy.mjs';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // Vercel rewrites provide the path explicitly; a direct call is still allowlisted.
    const route = url.searchParams.get('route');
    if (route !== null) {
      if (!/^[a-z0-9/.-]+$/.test(route) || route.includes('..')) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
      url.pathname = '/api/' + route; url.searchParams.delete('route');
      request = new Request(url, request);
    }
    return createPublicProxy({ origin: process.env.KNOWLEDGE_API_ORIGIN, forwardToken: process.env.PORTFOLIO_BRIDGE_TOKEN })(request);
  },
};
