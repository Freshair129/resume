import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves /api/* during `vite dev` by invoking the same Web-standard handlers that
// Vercel runs in production, so the chatbot works locally without `vercel dev`.
function vercelApiDev(env) {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      Object.assign(process.env, env)
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const name = req.url.slice('/api/'.length).split('?')[0].replace(/[^a-zA-Z0-9_-]/g, '')
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          const handler = mod[req.method] ?? mod.default
          if (typeof handler !== 'function') {
            res.statusCode = 405
            return res.end()
          }

          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
          }
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const hasBody = !['GET', 'HEAD'].includes(req.method)
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers,
            body: hasBody ? Buffer.concat(chunks) : undefined,
          })

          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          server.ssrFixStacktrace?.(err)
          console.error(`[vercel-api-dev] /api/${name} failed:`, err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Dev API handler failed. See terminal.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Only server-side keys; VITE_* vars are handled by Vite itself.
  const env = loadEnv(mode, process.cwd(), ['GEMINI_', 'SUPABASE_'])
  return {
    plugins: [react(), vercelApiDev(env)],
  }
})
