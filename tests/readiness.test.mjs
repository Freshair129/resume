import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './store.test.mjs';
import { isReady } from '../server/readiness.mjs';

async function publishedFixture() {
  const context = await setup(), { db, store, fixture } = context;
  const p = await store.ingest(fixture);
  await store.approve(p.id);
  const g = await store.publish(p.id, { model: 'bge', dimension: 1024 });
  await db.query("UPDATE index_generations SET state='active' WHERE id=$1", [g.id]);
  await db.query('UPDATE publication_state SET active_generation=$1 WHERE project_id=$2', [g.id, p.id]);
  const genesis = { assertQualified: async () => ({}), collections: async () => [{ name: g.collection, model: 'bge', dim: 1024, metric: 'Cosine', count: 1, index_lag: 0, coverage: { state: 'READY', validated: true, missing_count: 0, extra_count: 0, pending_count: 0 } }] };
  return { ...context, g, p, genesis };
}

test('a failed active pointer is unhealthy, not an intentionally empty portfolio', async () => {
  const { db, store, g, p, genesis } = await publishedFixture();
  try {
    assert.equal(await isReady(store, genesis, { model: 'bge', dimension: 1024 }), true);
    await db.query("UPDATE index_generations SET state='failed' WHERE id=$1", [g.id]);
    assert.deepEqual(await store.generations(), []); // Public retrieval must still deny it.
    assert.equal(await isReady(store, genesis, { model: 'bge', dimension: 1024 }), false);
    await db.query("UPDATE index_generations SET state='active' WHERE id=$1", [g.id]);
    await db.query('UPDATE projects SET revision=revision+1 WHERE id=$1', [p.id]);
    assert.equal(await isReady(store, genesis, { model: 'bge', dimension: 1024 }), false);
    await store.revoke(p.id);
    assert.equal(await isReady(store, genesis, { model: 'bge', dimension: 1024 }), true);
  } finally { await db.close(); }
});

test('the configured embedding model and dimension must match every active generation', async () => {
  const { db, store, genesis } = await publishedFixture();
  try {
    for (const embedding of [{ model: 'other', dimension: 1024 }, { model: 'bge', dimension: 384 }]) {
      assert.equal(await isReady(store, genesis, embedding), false);
    }
  } finally { await db.close(); }
});
