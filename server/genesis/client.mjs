import { createHash } from 'node:crypto';
import { GENESIS_MANIFEST } from './manifest.mjs';

/** @typedef {{id:string, label:string, properties:Record<string,unknown>, labels:string[]}} GenesisNode */
/** @typedef {{id:string,score:number,label:string,properties:Record<string,unknown>,path:unknown[]}} GenesisHit */
/** @typedef {{name:string,model:string,dim:number,metric:string,count:number,indexed:number,index_lag:number,coverage?:{state:string,validated:boolean,missing_count:number,extra_count:number,pending_count:number}}} GenesisCollection */

export class GenesisError extends Error {
  constructor(message, { code = 'GENESIS_REQUEST_FAILED', status = 0, category = 'unavailable' } = {}) {
    super(message);
    this.name = 'GenesisError';
    this.code = code;
    this.status = status;
    this.category = category;
  }
}

function identifier(value, kind = 'id') {
  if (typeof value !== 'string' || !value.length || value.length > 1024 || /[\u0000-\u001f]/u.test(value)) {
    throw new TypeError(`Invalid Genesis ${kind}`);
  }
  return value;
}
function collectionName(name) {
  if (typeof name !== 'string' || !/^[A-Za-z0-9_][A-Za-z0-9_-]{0,63}$/u.test(name)) throw new TypeError('Invalid Genesis collection name');
  return name;
}
function plainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Genesis properties must be an object');
  return value;
}
/** Canonicalize request keys before deriving the durable native transaction identity. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  if (value === undefined || (typeof value === 'number' && !Number.isFinite(value))) throw new TypeError('Genesis payload must contain JSON values');
  return value;
}
function protocolError() { return new GenesisError('Genesis returned an incompatible response', { code: 'GENESIS_RESPONSE_INVALID', category: 'integrity' }); }

/** Server-only REST adapter. Mutations use the pinned native transaction replay contract. */
export class GenesisClient {
  /** @param {{url:string,apiKey:string,dimension:number,model?:string,fetchImpl?:typeof fetch,timeoutMs?:number}} options */
  constructor({ url, apiKey, dimension, model = process.env.EMBEDDING_MODEL, fetchImpl = globalThis.fetch, timeoutMs = 15000 }) {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) throw new TypeError('GENESIS_API_URL must be a credential-free HTTP(S) origin');
    if (typeof apiKey !== 'string' || !apiKey.trim()) throw new TypeError('GENESIS_API_KEY is required');
    if (!Number.isInteger(dimension) || dimension < 1 || dimension > 65535) throw new TypeError('Invalid embedding dimension');
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw new TypeError('Invalid Genesis timeout');
    this.url = parsed.origin;
    this.apiKey = apiKey;
    this.dimension = dimension;
    this.model = identifier(model, 'model');
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  /** @private No automatic retries: callers replay the same deterministic transaction after recovery. */
  async request(path, { method = 'GET', body } = {}) {
    let response;
    try {
      response = await this.fetch(`${this.url}${path}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(this.timeoutMs),
        headers: { Authorization: `Bearer ${this.apiKey}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      // Never propagate fetch diagnostics containing URLs, credentials, or response content.
      throw new GenesisError('Genesis transport unavailable; mutation outcome may be uncertain');
    }
    let data;
    try { data = await response.json(); } catch { throw protocolError(); }
    if (!response.ok) {
      const code = typeof data?.error?.code === 'string' && /^GENESIS_[A-Z_]+$/u.test(data.error.code) ? data.error.code : 'GENESIS_REQUEST_FAILED';
      throw new GenesisError(`Genesis request rejected (HTTP ${response.status})`, { code, status: response.status, category: data?.error?.category || 'unavailable' });
    }
    return data;
  }

  /** @private */
  vector(vector) {
    if (!Array.isArray(vector) || vector.length !== this.dimension || vector.some(value => typeof value !== 'number' || !Number.isFinite(value))) throw new TypeError(`Embedding must contain ${this.dimension} finite numbers`);
    return vector;
  }

  /** @private Content-addressed transaction identity gives identical-retry safety across process restarts. */
  async commit({ nodes = [], edges = [], vectors = [] }) {
    const payload = canonical({ expected_frontier: null, relational: [], graph: { nodes, edges }, vectors });
    const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const result = await this.request('/v1/transaction/commit', { method: 'POST', body: { transaction_id: `portfolio:${digest}`, ...payload } });
    if (result?.stable !== true || result.transaction_id !== `portfolio:${digest}` || !Number.isSafeInteger(result.commit_sequence)) throw protocolError();
    return result;
  }

  /** @returns {Promise<GenesisCollection>} */
  async createCollection(name) {
    collectionName(name);
    const verify = entry => {
      if (entry.dim !== this.dimension || entry.model !== this.model || entry.metric.toLowerCase() !== 'cosine') throw new GenesisError('Genesis collection manifest mismatch', { code: 'GENESIS_MANIFEST_MISMATCH', category: 'integrity' });
      return entry;
    };
    const existing = (await this.collections()).find(entry => entry.name === name);
    if (existing) return verify(existing);
    try {
      await this.request('/v1/collection/create', { method: 'POST', body: { name, model: this.model, dim: this.dimension, metric: 'Cosine' } });
    } catch (error) {
      // A competing worker may have created the same collection; exact metadata must agree.
      const raced = (await this.collections()).find(entry => entry.name === name);
      if (!raced) throw error;
      return verify(raced);
    }
    const created = (await this.collections()).find(entry => entry.name === name);
    if (!created) throw protocolError();
    return verify(created);
  }

  /** @param {{id:string,label:string,properties:Record<string,unknown>}} input */
  async addNode({ id, label, properties }) {
    identifier(id); identifier(label, 'label'); plainObject(properties);
    await this.commit({ nodes: [{ id, labels: [label], props: properties }] });
    return this.getNode(id);
  }

  /** @param {{id:string,from:string,to:string,relation:string,properties?:Record<string,unknown>}} input */
  async addEdge({ id, from, to, relation, properties = {} }) {
    [id, from, to, relation].forEach(value => identifier(value)); plainObject(properties);
    await this.commit({ edges: [{ id, from, to, rel: relation, props: properties }] });
    const rows = await this.request('/v1/query', { method: 'POST', body: { from, to, rel: relation, limit: 1000, include_invalid: false } });
    if (!Array.isArray(rows)) throw protocolError();
    const edge = rows.find(row => row.id === id);
    if (!edge) throw new GenesisError('Genesis edge readback failed', { code: 'GENESIS_READBACK_FAILED', category: 'integrity' });
    return { ...edge, relation: edge.rel, properties: edge.props };
  }

  /** Native vectors identify a node, not a separate vector ID. One active vector per node/collection. */
  async addVector({ id, vector, collection }) {
    identifier(id); collectionName(collection); this.vector(vector);
    if (!(await this.getNode(id))) throw new GenesisError('Genesis vector node is absent', { code: 'GENESIS_NOT_FOUND', category: 'not_found' });
    return this.commit({ vectors: [{ node_id: id, collection, embedding: vector }] });
  }

  /** @returns {Promise<GenesisHit[]>} Candidate fields remain untrusted until canonical SQL authorization. */
  async hybridSearch({ queryVector, k = 12, alpha = 0, collection }) {
    this.vector(queryVector); collectionName(collection);
    if (!Number.isInteger(k) || k < 1 || k > 100 || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) throw new TypeError('Invalid hybrid search bounds');
    const rows = await this.request('/v1/search/hybrid', { method: 'POST', body: { query_vector: queryVector, k, alpha, collection } });
    if (!Array.isArray(rows) || rows.some(row => !row?.node || typeof row.node.id !== 'string' || !Number.isFinite(row.score) || !Array.isArray(row.node.labels) || !Array.isArray(row.path))) throw protocolError();
    return rows.map(row => ({ id: row.node.id, score: row.score, label: row.node.labels[0], properties: row.node.props, path: row.path }));
  }

  /** @returns {Promise<(GenesisNode & {incidentEdges:unknown[],vectorPresent:boolean,vectorCollection:string|null})|null>} */
  async getNode(id) {
    identifier(id);
    let data;
    try { data = await this.request(`/v1/studio/entity/${encodeURIComponent(id)}`); }
    catch (error) { if (error.status === 404 && error.code === 'GENESIS_NOT_FOUND') return null; throw error; }
    if (data?.node?.id !== id || !Array.isArray(data.node.labels) || !Array.isArray(data.incident_edges)) throw protocolError();
    return { id, label: data.node.labels[0], labels: data.node.labels, properties: data.properties, incidentEdges: data.incident_edges, vectorPresent: data.vector_present === true, vectorCollection: data.vector_collection ?? null };
  }

  async deleteNode(id) {
    identifier(id);
    throw new GenesisError('Pinned Genesis REST has no node deletion API; revoke SQL access first and rebuild the public projection for physical removal', { code: 'GENESIS_CAPABILITY_UNSUPPORTED', category: 'capability' });
  }

  /** @returns {Promise<GenesisCollection[]>} */
  async collections() {
    const rows = await this.request('/v1/collections');
    if (!Array.isArray(rows) || rows.some(row => typeof row.name !== 'string' || typeof row.model !== 'string' || !Number.isInteger(row.dim) || typeof row.metric !== 'string' || !Number.isInteger(row.count) || !Number.isInteger(row.index_lag))) throw protocolError();
    return rows;
  }

  /** Drain asynchronous HNSW and validate structural coverage. This does NOT request a snapshot/checkpoint. */
  async flush() {
    const data = await this.request('/v1/index/coverage/validate', { method: 'POST' });
    if (!Array.isArray(data?.reports) || data.reports.length === 0 || !data.frontier_before || !data.frontier_after || [data.frontier_before.frame, data.frontier_before.txn, data.frontier_after.frame, data.frontier_after.txn].some(value => !Number.isSafeInteger(value) || value < 0)) throw protocolError();
    if (JSON.stringify(data.frontier_before) !== JSON.stringify(data.frontier_after) || data.reports.some(row => row.validated !== true || row.state !== 'READY' || row.missing_count !== 0 || row.extra_count !== 0 || row.pending_count !== 0)) throw new GenesisError('Genesis structural index coverage is not ready', { code: 'GENESIS_INDEX_NOT_READY', category: 'integrity' });
    return data;
  }

  /** Behavioral readback only; REST does not return stored vector values or arbitrary collection membership. */
  async verifyVector({ id, vector, collection }) {
    await this.flush();
    const hits = await this.hybridSearch({ queryVector: vector, k: 100, alpha: 0, collection });
    if (!hits.some(hit => hit.id === id)) throw new GenesisError('Genesis vector self-query did not return the expected node', { code: 'GENESIS_READBACK_FAILED', category: 'integrity' });
    return { id, collection, method: 'native-self-query', rawVectorEqualityVerified: false };
  }

  async version() {
    const data = await this.request('/v1/version');
    if (data?.version !== GENESIS_MANIFEST.engineVersion) throw new GenesisError('Genesis runtime version mismatch', { code: 'GENESIS_MANIFEST_MISMATCH', category: 'integrity' });
    return data;
  }

  /** The upstream package version alone does not qualify transaction graph recovery. */
  async assertQualified() {
    const data = await this.version();
    if (data.build?.source_commit !== GENESIS_MANIFEST.engineCommit || data.build?.profile !== GENESIS_MANIFEST.buildProfile) {
      throw new GenesisError('Genesis build has not qualified native transaction graph recovery', { code: 'GENESIS_BUILD_UNQUALIFIED', category: 'capability' });
    }
    // Version/collection metadata remain readable during native recovery-required
    // state. Query is read-only and runs Storage::ensure_readable before scanning.
    const probe = await this.request('/v1/query', { method: 'POST', body: { from: 'portfolio:readiness:probe', limit: 1 } });
    if (!Array.isArray(probe)) throw protocolError();
    return data;
  }
}
