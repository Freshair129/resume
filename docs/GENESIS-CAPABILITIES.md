# GenesisBlockDB capability audit

## Current packaged qualification — 2026-10-29 review revision

The unpatched source findings below remain valid. The resume build now applies [0001-transaction-impact.patch](../infra/genesis/patches/0001-transaction-impact.patch) to that same immutable source pin. This is a **local packaged engine change**, not a claim that upstream main fixed the defect. [ADR-008](ADR-008-GENESIS-TRANSACTION-IMPACT.md) records scope and rollback.

- Native Rust regression: **76 passed across six targets** (four impact tests, REST, U3/P5 transactions, WAL tail, Wave A commit correctness). Every upserted node is recomputed, including a node whose last incoming edge was retargeted. [Output](evidence/native-rust-after.txt), [review RED evidence](evidence/native-review-rust-before.txt). No full upstream suite or performance qualification is claimed.
- Real REST+BGE-M3: **3 passed**, including live transaction graph ablation and forced-process restart. Vector-only English source ranks first at 1.0; graph alpha 0.8 promotes the Thai source supported by ten edges to 0.654541, above English 0.44. This ordering survives restart. [Native result](../server/genesis/native-evidence.json), [test output](evidence/native-graph-qualified.txt).
- Windows binary SHA-256: `610676bfac9657db6cca55871a7aa8a6048c4126d8c035950dfc1f7981f5cf34`; patch SHA-256: `3d27264b4119f0b85abbd28d63658f243daaa14138d2ef21e9019250098908bf`.
- Final Linux image also passed four build-time impact regressions and **3 real REST/BGE tests**, including forced restart. Image `sha256:c64c1b3e66fb3cb9969d57aba731c373a072e9c93abf9e8dcafd7df1134f3d7d`, binary `ea2153a68002950cb43a287930926d2f3bc002b14881420b78c909d60b5061b8`. [Linux result](evidence/native-linux.json), [test output](evidence/native-linux-tests.txt).
- Authenticated `/v1/version` adds `build.source_commit` and `build.profile=portfolio-transaction-impact-v1`. Client qualification rejects missing/mismatched fields and performs the read-only `POST /v1/query` probe (`from=portfolio:readiness:probe`, `limit=1`) to reject storage that requires recovery. Version and collection metadata alone do not check that state. Build self-description is not cryptographic attestation; retain source/patch/binary/image provenance.
- Application review regressions: **21 passed**. Readiness includes unhealthy public active pointers and rejects failed state, canonical revision mismatch, and configured embedding model/dimension mismatch; public retrieval retains its strict active-generation filter. Search rejects embedding configuration mismatch before provider calls. [Output](evidence/native-review-app-after.txt), [RED evidence](evidence/native-review-app-before.txt).
- Real PostgreSQL outbox activation/replay, TH/EN shared API search/citations, reconciliation and SQL revocation passed against this native build. [Pipeline evidence](evidence/native-pipeline-qualified.json). All content was synthetic in a fresh test schema; no owner facts were approved. LINE outbound transport was mocked.
- Physical deletion remains unsupported. The historical volume-restore policy rejection remains unresolved. Native graph qualification does not close either gate.

The worker projection currently gives each chunk one incoming `HAS_CHUNK` edge, so chunks have the same graph impact. The ten-support-edge synthetic ablation verifies engine capability and recovery; it is not evidence of better relevance in the application's current graph.

Reproduce native tests using the patched build, compile-time `GENESIS_SOURCE_COMMIT` and the command below. The Dockerfile applies the patch and runs its four core regression tests before packaging. Original unpatched evidence is preserved at [native-graph-unpatched.json](evidence/native-graph-unpatched.json); the historical report below describes that binary only.

## Historical unpatched audit

Source inspected on 2026-10-29: `Freshair129/GenesisBlock` commit `2527a8644f4be5d6c1e8722b24e71717e5ca9e4f`, Cargo package `0.2.10`. The five requested documents were read, together with actual `src/router.rs`, `src/main.rs`, and relevant `src/lib.rs`. Runtime proof is recorded separately below. A package version response alone does not attest a source commit.

## Verified source contract

| Application operation | Native interface and limitation |
| --- | --- |
| Collection creation | `POST /v1/collection/create`, `{name,model,dim,metric}`; max 64 ASCII letters/digits/underscore/hyphen. Adapter uses Cosine, verifies model/dimension/metric on replay. |
| Node | `NodeInput` uses `id`, `labels`, `props`; arbitrary caller IDs are preserved. Adapter accepts `label`/`properties` and translates. |
| Edge | `EdgeInput` uses `id`, `from`, `to`, `rel`, `props`. Direct add with the same ID overwrites the map but appends another history event; it is not a durable idempotency receipt. |
| Idempotent writes | `POST /v1/transaction/commit`, `{transaction_id,expected_frontier,relational,graph:{nodes,edges},vectors}`. Exact-payload retries return the previous stable commit; changed payload with the same ID conflicts. Adapter derives SHA-256 transaction IDs from canonical JSON. Generation nodes must be immutable. |
| Vector mapping | `vectors:[{node_id,collection,embedding}]` in the transaction, equivalent to supported `/v1/vector/add`. `id` in adapter means an existing **node ID**, not an independent vector ID. One active mapping per node/collection; replacement may retain historical arena slots. |
| Search | `POST /v1/search/hybrid` with `query_vector,k,alpha,collection`; current source returns `NeighborOutput` with a separate numeric `score`. Adapter returns `{id,score,label,properties,path}`. These remain candidates until PostgreSQL authorization. |
| Readback | `GET /v1/studio/entity/:entity_id` returns node, hydrated properties and bounded incident edges. `/v1/query` reads full matching edge properties. |
| Readiness | `/v1/collections` includes dimension/model/index lag/structural coverage. `POST /v1/index/coverage/validate` drains HNSW, checks actual source/HNSW membership, and returns before/after frontiers. Adapter `flush()` invokes this operation and requires a stable frontier and READY coverage. It is **not** a snapshot/checkpoint. |
| Vector readback | REST has no raw-vector getter. Studio `vector_present` checks the node's primary collection, so it cannot attest vectors attached separately to another collection. `verifyVector` performs native self-query plus coverage; this is behavioral evidence, not byte equality. |
| Node deletion | No node-delete route or HQL command exists. Transaction input has no `node_retractions`; that is an internal event member. `deleteNode()` fails explicitly with `GENESIS_CAPABILITY_UNSUPPORTED`. SQL revocation is immediate; physical cleanup needs a fresh approved-only projection/instance and operational swap. This acceptance gate remains open. |
| Checkpoint | No REST save-state/checkpoint route. The standalone server checkpoints during graceful shutdown; acknowledged writes are WAL durable. Never fabricate `/flush`, `/save`, or `/node/delete`. |
| Auth | Bearer shared secret guards `/v1/*`; `/metrics` is unguarded. Keep raw server on a private network. Source now binds loopback by default and requires nonempty key for a nonloopback bind. |

## Semantics and security boundaries

Native hybrid blends vector similarity and graph K-Impact; alpha zero is vector-only. It is not BM25. Native search does not promise a provenance traversal path (`path` is empty for direct hybrid hits). Provenance is verified separately through edge readback. Namespace/schema contract is draft and metadata is client-validated, not native tenant authorization. Public-approved content only belongs in the public instance; collection scope does not authorize graph access.

The separate GenesisRAG17 worker labels itself TEST and owns a SQLite FTS5 sidecar. This adapter does not adopt that lane or access engine SQLite. PostgreSQL stores canonical text, policy and projection references, never embeddings.

## Runtime and evidence

The existing upstream debug/release executables were found but their source provenance was not established. They were not used as proof for this source pin. `git archive` exported the exact commit into an isolated directory; Rust `1.96.0` built it with `cargo build --locked --no-default-features --features bins --bin genesis-db-server`, completing in 5m43s. The upstream checkout and its existing databases were read-only throughout.

- Executable: `F:\resume\app\server\genesis\.runtime\target\debug\genesis-db-server.exe`.
- Executable SHA-256: `037df13eb6cf6c2c7daaa718059ad8f02b8642beed25367cafb257a9e697df22`.
- Real provider: local Ollama, `bge-m3:latest`, 1,024 dimensions; model digest `7907646426070047a77226ac3e684fbbe8410524f7b4a74d02837e43f2146bab`.
- Ollama `/api/embed` and OpenAI-compatible `http://127.0.0.1:11434/v1/embeddings` both returned real TH/EN embeddings. The latter accepts `{model,input}` and returns `data[].embedding`. It is a developer provider, not production hosting evidence.
- Installed `hf.co/cstr/multilingual-e5-small-GGUF:IQ4_XS` failed at runtime with `bert model needs to define token type count`; it was not used as acceptance evidence. Installed Nomic returned 768 dimensions in a capability probe; it was not the acceptance model.
- Machine-readable measured results: [`native-evidence.json`](../server/genesis/native-evidence.json). Exact fixture run: `server/genesis/.runtime/native-cdOx18/evidence.json` (ignored local runtime). Three synthetic passages exercise English, Thai and unrelated content; they are not approved portfolio claims or a 20-question relevance evaluation.

| Native gate | Observed result |
| --- | --- |
| Missing/wrong bearer token | HTTP 401, passed |
| Model/dimension registration | 1,024-dimensional Cosine collection, passed |
| Native invalid dimension rejection | HTTP 400, passed |
| Node properties and unique edge provenance | Read back canonical reference/hash and ten unique support edges after duplicate retries, passed |
| Exact transaction replay | Same vector mapping count after duplicate write and crash restart, passed |
| Structural HNSW coverage | 3 source / 3 indexed / zero missing, extra or pending; stable frame/txn 33, passed |
| Real English and Thai self-query | Correct respective source ranked first, passed; this is behavioral vector readback, not retrieval-quality qualification |
| Forced-process restart | Named collection, vector retrieval, node/edge properties and replay identity survived WAL recovery, passed |
| Transaction-edge graph ranking | **FAILED**; alpha 0 and 0.8 had the same ranking despite ten incoming support edges |
| Direct-edge diagnostic | Graph ranking changed while live, then reverted after forced restart; **FAILED recovery qualification** |
| Physical node/vector cleanup | **UNSUPPORTED** by this REST pin |
| Linux container startup/backup/restore and production network | **NOT_RUN** |

The opt-in native test exits **1** because the graph-ablation subtest fails; a parent-test failure is also counted by Node. Other successful assertions are saved individually in the evidence JSON. No aggregate native PASS is claimed. Adapter unit tests pass 7/7 and do not qualify native retrieval.

`infra/genesis.Dockerfile` builds the exact engine source commit with `--locked --no-default-features --features bins`. Docker registry manifests were checked and Linux amd64 base images pinned: Rust `1.96-bookworm` digest `sha256:d99f7b31f49909348dc59b51f3c95d1efded1701ffb222f095aaab7de3c4abd8`, Debian `bookworm-slim` digest `sha256:a3bba7dc7dbcc1f37c2856c51fc9a7fac96608f50cb87b1b4e4d8b8c85ae988e`. The Docker image itself has not been built or published by this audit.

Native acceptance is opt-in via `GENESIS_NATIVE_TEST=1`. Missing required runtime/provider configuration then fails, rather than substituting a mock. Unit fake-fetch tests only validate REST mapping and error behavior.

Reproduce from the app root, using a build from the source pin:

```powershell
$env:GENESIS_NATIVE_TEST = '1'
$env:GENESIS_NATIVE_BINARY = (Resolve-Path 'server/genesis/.runtime/target/debug/genesis-db-server.exe').Path
$env:GENESIS_NATIVE_SOURCE_COMMIT = '2527a8644f4be5d6c1e8722b24e71717e5ca9e4f'
$env:GENESIS_TEST_EMBEDDING_MODEL = 'bge-m3:latest'
$env:GENESIS_TEST_EMBEDDING_DIMENSION = '1024'
$env:GENESIS_NATIVE_REPORT = 'server/genesis/native-evidence.json'
node --test tests/genesis-native.test.mjs
```

The harness chooses a free loopback port, random synthetic bearer secret and new isolated data directory. It stops every process it creates. `node server/genesis/start-isolated.mjs` separately starts a long-lived local integration instance only after matching the executable hash against recorded evidence; its key lives in an ignored runtime env file and is never printed. Stop that specific recorded PID after integration work.

## Upstream graph blocker and publication gate

At this exact pin, [`apply_transaction_memory`](https://github.com/Freshair129/GenesisBlock/blob/2527a8644f4be5d6c1e8722b24e71717e5ca9e4f/src/lib.rs#L16521) inserts edges without refreshing node K-Impact. [`add_edge`](https://github.com/Freshair129/GenesisBlock/blob/2527a8644f4be5d6c1e8722b24e71717e5ca9e4f/src/lib.rs#L21251) refreshes it in memory, but replay of the schema-6 transaction envelope does not. The controlled diagnostic made the supported Thai source rank first live (0.65454 versus English 0.44); after forced restart English led again (0.76 versus Thai 0.61454). Source and runtime evidence agree.

At the initial unpatched audit, the adapter retained durable idempotent transaction writes and `GENESIS_MANIFEST.nativeHybridGraphQualified` was **false** with the source rationale. Projection/readback could run, but publication remained gated on a corrected engine passing graph ablation and restart qualification. The current packaged patch and qualification at the top of this document supersede that local-build gate. The adapter still does not append direct-edge mutations as a hidden workaround, invent client-side graph scores, or substitute another index. Physical cleanup remains a separate unresolved upstream REST capability.

Required reference documents: [Quickstart](https://github.com/Freshair129/GenesisBlock/blob/2527a8644f4be5d6c1e8722b24e71717e5ca9e4f/QUICKSTART.md), [REST reference](https://github.com/Freshair129/GenesisBlock/blob/2527a8644f4be5d6c1e8722b24e71717e5ca9e4f/docs/API_REFERENCE.md), [documentation hub](https://github.com/Freshair129/GenesisBlock/blob/2527a8644f4be5d6c1e8722b24e71717e5ca9e4f/docs/README.md), [draft namespace contract](https://github.com/Freshair129/GenesisBlock/blob/2527a8644f4be5d6c1e8722b24e71717e5ca9e4f/docs/contracts/CONTRACT--CLIENT-NAMESPACE-AND-SCHEMA.md), [separate TEST worker](https://github.com/Freshair129/GenesisBlock/blob/2527a8644f4be5d6c1e8722b24e71717e5ca9e4f/genesisrag17-worker/README.md). Code resolves documentation drift: actual search output includes `score`, and current server binding defaults to loopback.

## Subsequent local container verification
The earlier audit built the unpatched pinned Linux image and started all Compose services, verified unauthenticated Genesis returns 401 and graph-node readback after container restart. See docs/evidence/container-verification.json. The prior NOT_RUN container row describes that audit's initial boundary; this subsequent evidence closed local startup/auth/node persistence only. Full Genesis volume restore was rejected before execution by automatic approval review (blocked by policy). The unpatched image's native graph-ablation defect remained open; that run does not qualify the final patched Linux image.

## Comparison with newer public-main source

The source audit's newer public-main commit, `a14b6ad498d738e7a2343c901fff2b958035eba9` (2026-10-29 12:14:45 +07:00, merge PR #277), was independently compared with tested pin `2527a8644f4be5d6c1e8722b24e71717e5ca9e4f`. The immutable Git object was already available locally and was extracted read-only into ignored `server/genesis/.runtime/main-a14b6ad`; no upstream checkout or runtime was modified.

Across **all `src/` files**, the diff changes only `src/lib.rs`: 38 insertions and 17 deletions. Those changes concern bounded exact candidate scans for small, non-temporal, lossless vector collections and associated comments. They do not change edge application, impact refresh, transaction mutation inputs, recovery, or REST routes.

| Capability checked at `a14b6ad` | Source evidence |
| --- | --- |
| Transaction/replay K-Impact | [`apply_transaction_memory`, line 16522](https://github.com/Freshair129/GenesisBlock/blob/a14b6ad498d738e7a2343c901fff2b958035eba9/src/lib.rs#L16522) is byte-for-byte identical to the tested function. Its edge loop inserts adjacency/map entries without `refresh_impacts`. |
| Direct edge refresh | [`add_edge`, line 21252](https://github.com/Freshair129/GenesisBlock/blob/a14b6ad498d738e7a2343c901fff2b958035eba9/src/lib.rs#L21252) still refreshes live in-memory impact, while the unchanged transaction replay path does not. |
| Node deletion through transaction input | [`GenesisTransaction`, line 2001](https://github.com/Freshair129/GenesisBlock/blob/a14b6ad498d738e7a2343c901fff2b958035eba9/src/lib.rs#L2001) still accepts `transaction_id`, `expected_frontier`, `relational`, `graph`, and `vectors`; there is no caller-facing node-retraction field. Internal event retractions do not create a REST deletion API. |
| REST delete/recompute/checkpoint support | [`src/router.rs`](https://github.com/Freshair129/GenesisBlock/blob/a14b6ad498d738e7a2343c901fff2b958035eba9/src/router.rs#L1559) is byte-identical to the tested router. No node-delete or K-Impact-recompute route was added. Edge retraction remains available, but does not delete nodes/vectors. |
| HQL delete/recompute support | [`src/query/hql.pest`](https://github.com/Freshair129/GenesisBlock/blob/a14b6ad498d738e7a2343c901fff2b958035eba9/src/query/hql.pest) is byte-identical and has no delete/retract/recompute command. |

Comparison hashes (SHA-256): latest `src/lib.rs` = `7c4fdda2fbb2d101f2e0b9eb887c12ebe952b65c5c9fe7cba6ddd50cfa80016a`; identical extracted `apply_transaction_memory` function = `7ac068eea87b64f20b37c1cb35f5dd300206e07cfbc186e7ab4a00c57c92711b`; unchanged router = `d0d741de8506ca46035b4501ee01f3971beb225f8b2d8fff5804b2fdc577552a`; unchanged HQL grammar = `797d3f0daf925e2098fd6fd881ebf1cbec32c6ca77761b787141f3d862708706`.

**Result:** source inspection confirms both blockers remain in newer public main. The native failure measurements above belong only to unpatched tested pin `2527a864`; `a14b6ad` was **not built or run** in this comparison. No runtime success/failure is transferred between pins. The later local packaged patch is separately qualified in the first section; it makes no qualification claim about unmodified public main.
