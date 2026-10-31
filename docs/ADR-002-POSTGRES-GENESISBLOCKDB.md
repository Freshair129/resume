# ADR-002 — PostgreSQL Canonical Data + GenesisBlockDB Search Projection

- **Status:** Accepted by owner (2026-10-29)
- **Document version:** 1.1
- **Applies to:** Freshair129/resume, Portfolio Knowledge Base, EVA, LINE OA, Codex MCP
- **Supersedes:** PRD/SRS v1.0 recommendation to use PostgreSQL with pgvector or treat GenesisBlockDB as optional.

## Context

The owner's requirement is **PostgreSQL + GenesisBlockDB only** for the portfolio knowledge layer. PostgreSQL provides canonical business records and publication policy. GenesisBlockDB is the mandatory store/engine for vector embeddings, graph relationships, HNSW and native semantic+graph hybrid retrieval. Both systems are intentional, but their data ownership must not overlap ambiguously.

Public clients are a website chatbot, LINE OA Agent and Codex MCP. Source content comes from resume documents, public GitHub repositories and approved case-study material. A reliable multi-channel public RAG requires citations, consent, approval, invalidation and a persistent engine.

## Decision

1. **PostgreSQL:** canonical `projects`, `profile`, `experiences`, `sources`, `source_documents`, `kb_chunks` (text and IDs, NO embeddings), `claims`, `publication_state`, `knowledge_outbox`, `index_generations`, resume variants and logs.
2. **GenesisBlockDB:** searchable `Project`, `SourceDocument`, `Chunk`, `Claim`, `Evidence`, `Skill`, `Technology` nodes and approved typed edges; stored vector embeddings and HNSW; native graph+vector hybrid search. All engine-internal WAL/SQLite structures remain engine-owned.
3. **Knowledge API:** sole authorized joining boundary. Website/EVA, LINE and Codex MCP call a shared service, not raw Genesis/Postgres. Genesis neighbor IDs are untrusted **candidates**; SQL reauthorization and exact source citation resolution are mandatory before any result is exposed.
4. **Projection:** Postgres transaction changes canonical facts and writes an outbox event; worker idempotently indexes into Genesis and records manifest/readback; SQL activates a verified generation. This is **not** cross-database atomic commit. On revocation, SQL blocks first and Genesis cleanup follows asynchronously with lag checks.
5. **Native hybrid semantics:** Genesis `hybridSearch({queryVector,k,alpha})` or REST `POST /v1/search/hybrid` blends vector similarity and graph K-Impact. It does **not** imply lexical/BM25 support. The separate GenesisRAG17 TEST worker uses a worker-owned SQLite FTS5 lexical lane; adopting such a lane requires validation and an additional ADR. Never substitute pgvector.
6. **Operations:** PostgreSQL plus persistent GenesisDB REST/embedded process and durable volume; server-only access keys; secured network, separate backups, restart/recovery, reindex and change monitoring. Vercel may serve UI and stateless routing, never the durable embedded Genesis file.

## Alternatives rejected

- **PostgreSQL + pgvector:** directly contradicts owner decision; duplicates Genesis vector/HNSW role.
- **PostgreSQL as an additional graph/search engine:** creates two search authorities and inconsistent ranking, increases maintenance burden.
- **GenesisBlockDB as canonical portfolio CMS/auth store:** removes clear SQL business authority and complicates editorial workflows; Genesis is the optimized retrieval index and may be rebuilt from approved SQL evidence.
- **Opening embedded Genesis on each Vercel Function request:** lacks durable local storage/process semantics and is not supported as a production topology.
- **Treating GenesisRAG17 TEST pipeline as production proof:** stage/worker profiles are documented as TEST and need independent qualification.

## Consequences / tradeoffs

- A SQL-to-Genesis projection is deliberately eventually consistent. Publication uses index-readiness/active-generation gates and a fail-closed SQL query check.
- Runtime includes a persistent service/container rather than only serverless functions. Monitor extra availability, backups and worker retry queues.
- Every user-facing answer must cite approved PostgreSQL documents even when nearest-neighbor candidates come from Genesis.
- External index lag/removal is observable and tested; SQL revocation must be immediate.

## Implementation contract and tests

- Pin installed Genesis engine version, REST API from `docs/API_REFERENCE.md`, schema/collection name and embedding model+dim; test live endpoints, bearer auth and invalid vector dimension.
- Test `POST /v1/search/hybrid` against seeded real 384-dimension (or configured verified dimension) TH/EN embeddings, with `alpha=0` and graph-aware `alpha>0`. Never use toy 3-number vectors in real tests.
- Verify node+edge provenance readback, durable restart, index lag/coverage, SQL outbox replay, full reconciliation, revoked document blocked with Genesis offline, model-version reindex and fallback when engine unavailable.
- Validate that PostgreSQL extensions, migrations and ORM models contain **no pgvector** objects.
- Define deployment diagram and env vars `DATABASE_URL`, `GENESIS_API_URL`, `GENESIS_API_KEY`, `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL`, and model/dimension/collection manifest; no actual credential in docs or frontend.

## Grounding (inspect pinned code, not just prose)

- Engine Quickstart: https://github.com/Freshair129/GenesisBlock/blob/main/QUICKSTART.md
- REST API reference: https://github.com/Freshair129/GenesisBlock/blob/main/docs/API_REFERENCE.md
- Standalone/domain-neutral boundary: https://github.com/Freshair129/GenesisBlock/blob/main/docs/README.md
- Namespace draft: https://github.com/Freshair129/GenesisBlock/blob/main/docs/contracts/CONTRACT--CLIENT-NAMESPACE-AND-SCHEMA.md
- Separate TEST worker and lexical caveat: https://github.com/Freshair129/GenesisBlock/blob/main/genesisrag17-worker/README.md
