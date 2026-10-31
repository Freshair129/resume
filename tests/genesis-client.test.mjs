import test from 'node:test';
import assert from 'node:assert/strict';
import { GenesisClient } from '../server/genesis/client.mjs';
import { GENESIS_MANIFEST, projectionNodeId } from '../server/genesis/manifest.mjs';

const vector = Array.from({ length: 384 }, (_, i) => i / 384); // Wire validation fixture; never native acceptance.
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
const options = { url: 'http://127.0.0.1:32100', apiKey: 'synthetic-test-key', dimension: 384, model: 'test-wire-model' };

test('native transaction replay identity preserves caller IDs and canonical property order', async () => {
  const requests = [];
  const client = new GenesisClient({ ...options, fetchImpl: async (url, init) => {
    requests.push({ url, init, body: init.body && JSON.parse(init.body) });
    if (url.endsWith('/transaction/commit')) return response({ stable: true, transaction_id: requests.at(-1).body.transaction_id, commit_sequence: 1 });
    return response({ node: { id: 'portfolio:chunk:1:g1', labels: ['Chunk'] }, properties: { canonical_id: '1', generation: 'g1' }, incident_edges: [] });
  } });
  await client.addNode({ id: 'portfolio:chunk:1:g1', label: 'Chunk', properties: { canonical_id: '1', generation: 'g1' } });
  await client.addNode({ id: 'portfolio:chunk:1:g1', label: 'Chunk', properties: { generation: 'g1', canonical_id: '1' } });
  assert.deepEqual(requests[0].body, requests[2].body);
  assert.equal(requests[0].body.graph.nodes[0].props.canonical_id, '1');
  assert.equal(requests[0].init.headers.Authorization, 'Bearer synthetic-test-key');
  assert.equal(requests[0].init.redirect, 'error');
});

test('hybridSearch sends only verified fields and normalizes native score', async () => {
  let payload;
  const client = new GenesisClient({ ...options, fetchImpl: async (_url, init) => {
    payload = JSON.parse(init.body);
    return response([{ node: { id: 'portfolio:chunk:1:g1', labels: ['Chunk'], props: { untrusted: true } }, score: 0.7, path: [] }]);
  } });
  const hits = await client.hybridSearch({ queryVector: vector, k: 3, alpha: 0.4, collection: 'portfolio_g1', filters: { visibility: 'public' } });
  assert.deepEqual(Object.keys(payload).sort(), ['alpha', 'collection', 'k', 'query_vector']);
  assert.equal(hits[0].id, 'portfolio:chunk:1:g1');
  assert.equal(hits[0].score, 0.7);
});

test('invalid vectors and unsupported deletion fail before network', async () => {
  let calls = 0;
  const client = new GenesisClient({ ...options, fetchImpl: async () => { calls++; throw new Error('unused'); } });
  await assert.rejects(client.hybridSearch({ queryVector: [1, 2, 3], collection: 'p' }), /384/);
  await assert.rejects(client.hybridSearch({ queryVector: vector.map(() => NaN), collection: 'p' }), /finite/);
  await assert.rejects(client.deleteNode('portfolio:chunk:1:g1'), { code: 'GENESIS_CAPABILITY_UNSUPPORTED' });
  assert.equal(calls, 0);
});

test('collection replay rejects wrong model or dimension', async () => {
  const client = new GenesisClient({ ...options, fetchImpl: async () => response([{ name: 'p', model: 'other', dim: 384, metric: 'Cosine', count: 0, index_lag: 0 }]) });
  await assert.rejects(client.createCollection('p'), { code: 'GENESIS_MANIFEST_MISMATCH' });
});

test('coverage must be READY with unchanged frontier and zero missing rows', async () => {
  const client = new GenesisClient({ ...options, fetchImpl: async () => response({ frontier_before: { frame: 1, txn: 1 }, frontier_after: { frame: 2, txn: 2 }, reports: [{ validated: true, state: 'READY', missing_count: 0, extra_count: 0, pending_count: 0 }] }) });
  await assert.rejects(client.flush(), { code: 'GENESIS_INDEX_NOT_READY' });
});

test('provider errors never echo raw response messages or credentials', async () => {
  const client = new GenesisClient({ ...options, fetchImpl: async () => response({ error: { code: 'GENESIS_UNAUTHORIZED', message: 'do-not-echo-response-secret' } }, 401) });
  await assert.rejects(client.collections(), error => error.code === 'GENESIS_UNAUTHORIZED' && !error.message.includes('do-not-echo'));
});

test('generation is part of external node identity', () => {
  assert.notEqual(projectionNodeId('Chunk', 'same-canonical-id', 'g1'), projectionNodeId('Chunk', 'same-canonical-id', 'g2'));
});

test('unqualified or mismatched runtime cannot authorize native publication', async () => {
  for (const build of [undefined, { source_commit: 'wrong', profile: 'portfolio-transaction-impact-v1' }, { source_commit: GENESIS_MANIFEST.engineCommit, profile: 'unknown' }]) {
    const client = new GenesisClient({ ...options, fetchImpl: async () => response({ version: '0.2.10', build }) });
    await assert.rejects(client.assertQualified(), { code: 'GENESIS_BUILD_UNQUALIFIED' });
  }
  const build = { source_commit: GENESIS_MANIFEST.engineCommit, profile: 'portfolio-transaction-impact-v1' };
  const client = new GenesisClient({ ...options, fetchImpl: async (url, init) => {
    if (url.endsWith('/v1/version')) return response({ version: '0.2.10', build });
    assert.equal(url, `${options.url}/v1/query`);
    assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(init.body), { from: 'portfolio:readiness:probe', limit: 1 });
    return response([]);
  } });
  assert.deepEqual((await client.assertQualified()).build, build);
});

test('a self-described qualified build in recovery-required state cannot report readiness', async () => {
  const client = new GenesisClient({ ...options, fetchImpl: async url => url.endsWith('/v1/version')
    ? response({ version: '0.2.10', build: { source_commit: GENESIS_MANIFEST.engineCommit, profile: 'portfolio-transaction-impact-v1' } })
    : response({ error: { code: 'GENESIS_RECOVERY_REQUIRED' } }, 503) });
  await assert.rejects(client.assertQualified(), { code: 'GENESIS_RECOVERY_REQUIRED' });
});
