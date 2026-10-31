/** Read-only readiness. A build flag alone says nothing about the running services. */
export async function isReady(store, genesis, embeddings) {
  try {
    await store.db.query('SELECT 1');
    await genesis.assertQualified();
    const [generations, collections] = await Promise.all([store.generations({ includeUnhealthy: true }), genesis.collections()]);
    return generations.every(g => {
      const c = collections.find(row => row.name === g.collection), coverage = c?.coverage;
      return g.state === 'active' && g.revision === g.canonical_revision
        && g.model === embeddings?.model && g.dimension === embeddings?.dimension
        && c && c.model === g.model && c.dim === g.dimension && c.metric.toLowerCase() === 'cosine'
        && Number.isInteger(g.expected_chunks) && g.expected_chunks > 0 && c.count === g.expected_chunks
        && c.index_lag === 0 && coverage?.validated === true && coverage.state === 'READY'
        && coverage.missing_count === 0 && coverage.extra_count === 0 && coverage.pending_count === 0;
    });
  } catch { return false; }
}
