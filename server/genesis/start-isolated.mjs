/** Local integration helper. Creates fresh TEST data and a private ignored env file. */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { GenesisClient } from './client.mjs';
import { GENESIS_MANIFEST } from './manifest.mjs';

const root = resolve('server/genesis/.runtime');
await mkdir(root, { recursive: true });
const binary = resolve(process.env.GENESIS_NATIVE_BINARY || join(root, 'target/debug/genesis-db-server.exe'));
const evidence = JSON.parse(await readFile(resolve('server/genesis/native-evidence.json'), 'utf8'));
if (evidence.sourceCommit !== GENESIS_MANIFEST.engineCommit || evidence.binarySha256 !== createHash('sha256').update(await readFile(binary)).digest('hex')) throw new Error('Native executable does not match recorded source/binary evidence');
const runDir = await mkdtemp(join(root, 'integration-'));
const socket = createServer();
socket.listen(0, '127.0.0.1');
await once(socket, 'listening');
const port = socket.address().port;
await new Promise(resolve => socket.close(resolve));
const url = `http://127.0.0.1:${port}`;
const apiKey = randomBytes(24).toString('hex');
const model = evidence.model;
const dimension = evidence.dimension;
const child = spawn(binary, [], { windowsHide: true, detached: true, cwd: runDir, env: { ...process.env, GENESIS_HOST: '127.0.0.1', GENESIS_PORT: String(port), GENESIS_DATA_DIR: join(runDir, 'data'), GENESIS_API_KEY: apiKey, RUST_LOG: 'error' }, stdio: 'ignore' });
const client = new GenesisClient({ url, apiKey, dimension, model, timeoutMs: 2000 });
let ready = false;
for (let i = 0; i < 50; i++) {
  try { await client.version(); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 200)); }
}
if (!ready) { child.kill(); throw new Error('Isolated native engine failed startup'); }
const envPath = join(runDir, 'integration.env');
await writeFile(envPath, `GENESIS_API_URL=${url}\nGENESIS_API_KEY=${apiKey}\nEMBEDDING_PROVIDER=openai-compatible\nEMBEDDING_URL=http://127.0.0.1:11434/v1/embeddings\nEMBEDDING_API_KEY=local-ollama\nEMBEDDING_MODEL=${model}\nEMBEDDING_DIMENSION=${dimension}\n`, { mode: 0o600 });
await writeFile(join(runDir, 'process.json'), JSON.stringify({ pid: child.pid, binary, url, dataDir: join(runDir, 'data'), envPath, sourceCommit: GENESIS_MANIFEST.engineCommit }, null, 2));
child.unref();
console.log(JSON.stringify({ pid: child.pid, url, envPath, dataDir: join(runDir, 'data') }));
