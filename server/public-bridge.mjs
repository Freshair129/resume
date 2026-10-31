import { createBridgeServer } from './public/bridge.mjs';
if (!process.env.PORTFOLIO_BRIDGE_TOKEN || process.env.PORTFOLIO_BRIDGE_TOKEN.length < 32) throw new Error('PORTFOLIO_BRIDGE_TOKEN_REQUIRED');
const server = createBridgeServer({ origin: process.env.KNOWLEDGE_API_ORIGIN || 'http://api:3100', requiredToken: process.env.PORTFOLIO_BRIDGE_TOKEN });
server.listen(3102, '127.0.0.1', () => console.log('Restricted portfolio bridge listening on loopback'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
