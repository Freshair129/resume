import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdir, mkdtemp, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { GenesisClient } from '../server/genesis/client.mjs';
import { GENESIS_MANIFEST, projectionNodeId } from '../server/genesis/manifest.mjs';

const enabled = process.env.GENESIS_NATIVE_TEST === '1';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('native Genesis: real multilingual embedding, bearer auth, replay, graph ablation and crash restart', { skip: !enabled && 'NOT_RUN: set GENESIS_NATIVE_TEST=1 with an isolated executable and real Ollama embedding provider', timeout: 240000 }, async (t) => {
  assert.ok(process.env.GENESIS_NATIVE_BINARY, 'GENESIS_NATIVE_BINARY is required: native tests do not substitute mocks');
  assert.equal(process.env.GENESIS_NATIVE_SOURCE_COMMIT, GENESIS_MANIFEST.engineCommit, 'Build provenance must name the audited exact commit');
  const binary = resolve(process.env.GENESIS_NATIVE_BINARY);
  await stat(binary);
  const model = process.env.GENESIS_TEST_EMBEDDING_MODEL || 'bge-m3:latest';
  const embeddingUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const dimension = Number(process.env.GENESIS_TEST_EMBEDDING_DIMENSION || 1024);
  const modelListResponse = await fetch(`${embeddingUrl}/api/tags`, { signal: AbortSignal.timeout(10000) });
  assert.equal(modelListResponse.status, 200);
  const modelRecord = (await modelListResponse.json()).models?.find(entry => entry.name === model);
  assert.ok(modelRecord?.digest, 'Real embedding model digest must be captured');
  const expectedModelDigest = process.env.GENESIS_TEST_EMBEDDING_DIGEST || (model === 'bge-m3:latest' ? '7907646426070047a77226ac3e684fbbe8410524f7b4a74d02837e43f2146bab' : undefined);
  assert.ok(expectedModelDigest, 'Set GENESIS_TEST_EMBEDDING_DIGEST when selecting another model');
  assert.equal(modelRecord.digest, expectedModelDigest, 'Embedding model tag changed; do not silently reuse an old generation');
  const root = resolve('server/genesis/.runtime');
  await mkdir(root, { recursive: true });
  const runDir = await mkdtemp(join(root, 'native-'));
  const dataDir = join(runDir, 'data');
  const texts = [
    'passage: The synthetic Aurora project stores approved source documents in PostgreSQL and uses a native vector and graph engine for knowledge retrieval.',
    'passage: โครงการทดสอบออโรราจัดเก็บเอกสารที่อนุมัติใน PostgreSQL และใช้ฐานข้อมูลเวกเตอร์กับกราฟเพื่อค้นคืนความรู้พร้อมหลักฐาน',
    'passage: This synthetic recipe describes baking bread with flour, water, yeast and salt.',
  ];
  const embedResponse = await fetch(`${embeddingUrl}/api/embed`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, input: texts, keep_alive: 0 }), signal: AbortSignal.timeout(120000) });
  assert.equal(embedResponse.status, 200, 'A real embedding provider must be available');
  const { embeddings } = await embedResponse.json();
  assert.equal(embeddings?.length, texts.length);
  for (const embedding of embeddings) assert.ok(embedding.length === dimension && embedding.every(Number.isFinite), 'Real model dimension must match manifest');
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const url = `http://127.0.0.1:${port}`;
  const apiKey = randomBytes(24).toString('hex');
  const client = new GenesisClient({ url, apiKey, dimension, model, timeoutMs: 30000 });
  let child;
  async function start() {
    child = spawn(binary, [], { windowsHide: true, cwd: runDir, env: { ...process.env, GENESIS_HOST: '127.0.0.1', GENESIS_PORT: String(port), GENESIS_API_KEY: apiKey, GENESIS_DATA_DIR: dataDir, RUST_LOG: 'error' }, stdio: 'ignore' });
    let spawnError;
    child.once('error', error => { spawnError = error; });
    for (let i = 0; i < 100; i++) {
      if (spawnError) throw new Error('Native server executable could not start');
      if (child.exitCode !== null) throw new Error(`Native server exited before readiness (${child.exitCode})`);
      try { await client.version(); return; } catch { await delay(100); }
    }
    throw new Error('Native server did not become ready');
  }
  async function stop() {
    if (!child || child.exitCode !== null) return;
    const exited = once(child, 'exit');
    child.kill('SIGKILL');
    await exited;
  }
  const collection = 'portfolio_native_fixture';
  const ids = ['en-source', 'th-supported', 'unrelated-recipe'].map(id => projectionNodeId('Chunk', id, 'native-v1'));
  try {
    await start();
    const runtimeBuild = await client.assertQualified();
    assert.equal((await fetch(`${url}/v1/collections`)).status, 401);
    assert.equal((await fetch(`${url}/v1/collections`, { headers: { Authorization: 'Bearer invalid-synthetic-key' } })).status, 401);
    await client.createCollection(collection);
    await client.createCollection(collection);
    for (let i = 0; i < ids.length; i++) {
      await client.addNode({ id: ids[i], label: 'Chunk', properties: { client_namespace: 'portfolio', schema_ref: GENESIS_MANIFEST.schemaRef, index_generation: 'native-v1', canonical_id: `fixture-${i}`, fixture_only: true, source_sha: createHash('sha256').update(texts[i]).digest('hex') } });
      await client.addVector({ id: ids[i], vector: embeddings[i], collection });
    }
    const countBefore = (await client.collections()).find(row => row.name === collection).count;
    await client.addVector({ id: ids[0], vector: embeddings[0], collection });
    assert.equal((await client.collections()).find(row => row.name === collection).count, countBefore, 'Exact transaction replay must not add another vector slot');
    for (let i = 0; i < 12; i++) {
      const evidence = projectionNodeId('Evidence', `fixture-evidence-${i}`, 'native-v1');
      await client.addNode({ id: evidence, label: 'Evidence', properties: { fixture_only: true } });
      const to = i === 0 ? ids[0] : i === 1 ? ids[2] : ids[1];
      const edge = { id: `portfolio:edge:fixture-${i}`, from: evidence, to, relation: 'SUPPORTED_BY', properties: { fixture_only: true, source_sha: 'synthetic-native-acceptance' } };
      await client.addEdge(edge);
      await client.addEdge(edge);
    }
    const coverage = await client.flush();
    const invalidDimension = await fetch(`${url}/v1/vector/add`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ node_id: ids[0], collection, embedding: embeddings[0].slice(1) }) });
    assert.equal(invalidDimension.status, 400, 'Native engine independently rejects dimension mismatch');
    const baseline = await client.hybridSearch({ queryVector: embeddings[0], k: 3, alpha: 0, collection });
    const graph = await client.hybridSearch({ queryVector: embeddings[0], k: 3, alpha: 0.8, collection });
    const thai = await client.hybridSearch({ queryVector: embeddings[1], k: 3, alpha: 0, collection });
    assert.equal(baseline[0].id, ids[0]);
    assert.equal(thai[0].id, ids[1]);
    const graphAblationPassed = graph[0].id === ids[1] && JSON.stringify(graph.map(hit => hit.id)) !== JSON.stringify(baseline.map(hit => hit.id));
    await t.test('graph K-Impact must distinguish a supported source from vector-only ranking', () => {
      assert.notDeepEqual(graph.map(hit => hit.id), baseline.map(hit => hit.id), 'Graph contribution must measurably alter ranking');
      assert.equal(graph[0].id, ids[1], 'Fixture-supported Thai source should lead graph-aware ranking');
    });
    const readback = await client.getNode(ids[1]);
    assert.equal(readback.properties.canonical_id, 'fixture-1');
    assert.equal(readback.incidentEdges.length, 10, 'Edge replay must preserve ten unique relationships');
    await client.verifyVector({ id: ids[0], vector: embeddings[0], collection });
    await assert.rejects(client.deleteNode(ids[0]), { code: 'GENESIS_CAPABILITY_UNSUPPORTED' });
    await stop();
    await start();
    await client.flush();
    const restarted = await client.hybridSearch({ queryVector: embeddings[0], k: 3, alpha: 0, collection });
    assert.equal(restarted[0].id, ids[0]);
    const restartedGraph = await client.hybridSearch({ queryVector: embeddings[0], k: 3, alpha: 0.8, collection });
    await t.test('transaction graph ranking survives a forced process restart', () => {
      assert.equal(restartedGraph[0].id, ids[1], 'Durable support edges must influence recovered native ranking');
      assert.deepEqual(restartedGraph.map(({ id }) => id), graph.map(({ id }) => id));
    });
    assert.equal((await client.getNode(ids[1])).incidentEdges.length, 10);
    await client.addVector({ id: ids[0], vector: embeddings[0], collection });
    assert.equal((await client.collections()).find(row => row.name === collection).count, countBefore);
    // Diagnostic only in this throwaway fixture: direct add refreshes in-memory impact,
    // but appends new revisions and cannot replace the production replay contract.
    for (let i = 0; i < 12; i++) {
      await client.request('/v1/edge/add', { method: 'POST', body: { id: `portfolio:edge:fixture-${i}`, from: projectionNodeId('Evidence', `fixture-evidence-${i}`, 'native-v1'), to: i === 0 ? ids[0] : i === 1 ? ids[2] : ids[1], rel: 'SUPPORTED_BY', props: { fixture_only: true, source_sha: 'synthetic-native-acceptance' } } });
    }
    const directEdgeGraph = await client.hybridSearch({ queryVector: embeddings[0], k: 3, alpha: 0.8, collection });
    await stop();
    await start();
    await client.flush();
    const directEdgeRestartGraph = await client.hybridSearch({ queryVector: embeddings[0], k: 3, alpha: 0.8, collection });
    const evidence = { observedAt: new Date().toISOString(), sourceCommit: GENESIS_MANIFEST.engineCommit, engineVersion: GENESIS_MANIFEST.engineVersion, build: runtimeBuild.build, patchSha256: createHash('sha256').update(await readFile('infra/genesis/patches/0001-transaction-impact.patch')).digest('hex'), binarySha256: createHash('sha256').update(await readFile(binary)).digest('hex'), model, modelDigest: modelRecord.digest, dimension, corpus: 'Synthetic bilingual fixture; not owner-approved portfolio content', textsSha256: createHash('sha256').update(JSON.stringify(texts)).digest('hex'), baseline: baseline.map(({ id, score }) => ({ id, score })), graph: graph.map(({ id, score }) => ({ id, score })), restartedGraph: restartedGraph.map(({ id, score }) => ({ id, score })), graphRestartPassed: restartedGraph[0].id === ids[1], thai: thai.map(({ id, score }) => ({ id, score })), coverage, realEmbedding: true, crashRestartPassed: true, nativeAuthPassed: true, nodeEdgeProvenanceReadbackPassed: true, replayAfterRestartPassed: true, graphAblationPassed, graphBlocker: graphAblationPassed ? null : 'Native transaction graph ranking did not qualify', directEdgeDiagnostic: { liveRanking: directEdgeGraph.map(({ id, score }) => ({ id, score })), afterCrashRanking: directEdgeRestartGraph.map(({ id, score }) => ({ id, score })), liveSupportedSourceRanksFirst: directEdgeGraph[0].id === ids[1], afterCrashSupportedSourceRanksFirst: directEdgeRestartGraph[0].id === ids[1], adoptedByProductionAdapter: false }, physicalDeletion: 'UNSUPPORTED', containerRestore: 'NOT_RUN' };
    await writeFile(join(runDir, 'evidence.json'), JSON.stringify(evidence, null, 2));
    if (process.env.GENESIS_NATIVE_REPORT) await writeFile(resolve(process.env.GENESIS_NATIVE_REPORT), JSON.stringify(evidence, null, 2));
    console.log(`Native evidence: ${join(runDir, 'evidence.json')}`);
  } finally { await stop(); }
});
