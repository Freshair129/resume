# Codex Master Implementation Prompt — Portfolio Intelligence Platform v1.1

> Paste the following into Codex with the accompanying `PORTFOLIO-KB-PRD-SRS-ARCH-v1.1.md` and `ADR-002-POSTGRES-GENESISBLOCKDB.md` at the project root or `docs/`. Repo: `https://github.com/Freshair129/resume`. This is an **execution prompt**, not just a request to write further documents.

---

You are the **lead product engineer, full-stack architect, RAG engineer, security reviewer, QA engineer and technical writer** for Pornpon's professional portfolio and AI Automation showcase.

## Mission

Take the existing **Freshair129/resume** application and ship an evidence-backed, bilingual professional portfolio with a shared Portfolio Knowledge Base (PKB). Four clients must reuse the **same trusted knowledge**: the public website, the on-site EVA chatbot, a LINE Official Account agent, and Codex through a permissioned read-only MCP adapter. Provide downloadable **real PDF** resumes. The system should be easy to enrich as new projects are built, without duplicating bios or hallucinating claims.

**Mandatory reference:** Read `PORTFOLIO-KB-PRD-SRS-ARCH-v1.1.md` and `ADR-002-POSTGRES-GENESISBLOCKDB.md` in full. Treat it as the PRD/SRS/architecture contract and acceptance checklist; resolve ambiguities through an ADR and evidence. It is permitted to suggest surgical adjustments where current repo evidence contradicts assumptions; do not silently shrink the scope.

## First: audit the current repo and real deployment

1. Inspect the current branch, repo tree, readme, package files, `src/App.jsx`, `src/Portfolio.jsx`, `src/ProjectsSection.jsx`, `src/Resume.jsx`, `src/data/resumeVariants.js`, `src/data/translations.js`, the `src/chatbot` directory, `resume_th.md`, build/deployment configuration and existing assets. Determine what already works and reuse it.
2. Verify whether the correct source is `Freshair129/resume` and whether an existing production deployment is connected to the authenticated Vercel account. The historical URL `https://resume-ecru-five-15.vercel.app/` is **unverified**; never claim it is the active deployment without testing.
3. **Security gate first:** `.env` appeared in the root directory listing and the old chatbot contains a browser-side `VITE_GEMINI_API_KEY` call path. Do NOT print secret values in responses, logs, diffs, screenshots or PRs. Check for historical exposure, remove tracked secret files, add safe ignore rules and example placeholders, rotate/revoke actual exposed keys via the authorized owner workflow, and migrate model calls server-side. Never commit regenerated credentials.
4. Produce `docs/BASELINE-AUDIT.md` containing existing features, source-of-truth conflicts, deploy uncertainty, codebase risk, secrets remediation status (without values), and chosen migration strategy.
5. Choose **incremental React/Vite** by default; Vercel may host frontend/static and optional stateless API proxy only. **GenesisBlockDB must run as a persistent service/worker with its own durable volume**, not in ephemeral Vercel Functions. Implement the Knowledge API/worker near the Genesis instance or verify secure reachability from the chosen API host. If you prove Next.js necessary for SEO/SSR, create ADR-001 and migrate with parity checks. Avoid unnecessary rewrites.
6. Independently inspect `Freshair129/GenesisBlock` `QUICKSTART.md`, `docs/API_REFERENCE.md`, `docs/README.md`, `docs/contracts/CONTRACT--CLIENT-NAMESPACE-AND-SCHEMA.md` and `genesisrag17-worker/README.md`. Pin an actual tested version/commit and **verify real method names, payload shapes and capabilities** against the runtime. The native `hybridSearch` is vector+graph; lexical FTS5 is separate TEST-worker functionality, not a guaranteed core BM25 API. Record gaps rather than inventing APIs.

## Implement the platform (not merely a prototype or another prompt)

**Content, provenance and review**
- Define and migrate **ordinary PostgreSQL** canonical schema for profile, career, skills, projects, project links/assets, sources, documents, canonical chunks, claims, publication/version authority, resume variants, jobs, a transactional `knowledge_outbox`, `index_generations`, `knowledge_index_records`, scoped clients and logs. **No pgvector extension, vector column, SQL ANN index or SQL vector-distance query.** Embeddings and retrieval graph belong **only** in GenesisBlockDB.
- Keep `public`, `review` and `private` separate at the database query and authorization layer. Only **owner-approved public** artifacts may be indexed into publicly retrievable chunks. Enforce RLS/server auth and test direct access; never trust a frontend visibility flag.
- Import project candidates from the owner's GitHub sources (Zuri AI, GenesisBlockDB, FUNG, crmapp, Zuri-Go, RWANG, Local LLM Hub, Visual Office, G-Maiden, Land of smile). Read actual README, release docs and relevant architecture docs. Track repo URL, file path, section anchor, SHA and content hash. Filter `.env`, secrets, logs, generated content, customer data, private repos and files lacking permission. Distinguish proposal/prototype/tested/deployed/released precisely.
- Treat facts in `resume_th.md`, `translations.js`, Google Docs export and other old variants as **conflicting candidate inputs** until reconciled. Never invent achievements, dates, metrics, expertise or client endorsements. Write a concise `docs/CLAIMS-REVIEW.md` for records requiring owner verification.
- Build an authenticated owner review/publish workflow. Only approved claims appear in public resume, site, chat or LINE. Publishing requires a verified Genesis projection generation before the SQL active-generation pointer changes. **Unpublish must first revoke SQL authorization immediately**, then issue an idempotent outbox cleanup to Genesis; stale Genesis hits and cached responses must fail closed even if the index worker is offline.

**RAG retrieval and answer service**
- Implement ingest → sanitize → normalize → owner review → canonical PostgreSQL chunks + transactional outbox → server-side embedding → **GenesisBlockDB native graph nodes/edges + vector collections/HNSW** → **native hybrid search (vector + graph)** → PostgreSQL active-generation/visibility recheck → citation resolution → guarded answer generation. Support Thai and English. Never use pgvector or a separate competing graph/vector store.
- Implement a typed `GenesisClient` using verified native Node bindings or Genesis REST (`POST /v1/search/hybrid` with `query_vector`, `k`, `alpha`, `collection`; `POST /v1/node/add`, `/v1/edge/add`, `/v1/vector/add` and other routes only as available). Never invent metadata filters or native full-text/BM25 endpoints. Use server-only `GENESIS_API_URL`, `GENESIS_API_KEY` and validate the engine's model/dimension/coverage/readiness.
- Build client-owned graph schema (projects, sources, evidence, approved claims, technologies, skills, document chunks and actual cited relations), deterministic IDs and idempotent projection. Query `alpha=0` vector-only baseline against positive-alpha graph-aware hybrid; demonstrate meaningful relevance or relation benefit. Preserve exact citations and provenance.
- For exact acronyms, titles and version identifiers support canonical PostgreSQL structured lookups and/or a *separately qualified* lexical index. GenesisRAG17's worker-owned FTS5 is presently a TEST profile; optional lexical + vector + graph fusion requires a written capability/production qualification ADR. Do not claim core native lexical search exists.
- Design backfill/reindex, outbox retries, generation-aware atomic publication pointer, PostgreSQL revocation gate, Genesis index readback/restart verification, drift reconciliation and restore runbook. Do not attempt a fictitious cross-database atomic commit; keep only public-approved content in the MVP's public Genesis collection/instance.
- Build a server-side provider abstraction. Never ship provider keys to client code. Make API/model outage degrade to source-backed navigation/FAQ rather than fake answers. Bound retrieval, model tokens, cost, timeouts, prompt injection, abuse and logging.
- Create one `KnowledgeSearchService` + `AnswerService` reused by web/LINE. Return `{answer, citations, confidence, suggested_questions}`. Low evidence = explicit uncertainty, not invention. Cite actual approved project/repo links.
- Write at least 20 TH/EN RAG evaluation questions with expected evidence and forbidden-claim cases; save reproducible results, not made-up scores.

**Public website + resumes**
- Keep useful original design, photos, projects, portfolio/gallery and existing EVA branding. Improve to a premium, mobile-first, fast, accessible **AI Automation & Agentic Systems** portfolio. Required pages: home, projects, case studies, resume, about, contact, privacy; project status and evidence are visible.
- Hero default is AI Automation; expose clear calls to action: Explore Projects, Download PDF Resume, Ask EVA, Contact/LINE. Add filters and relevant case study screenshots/architecture diagrams. Do not present all repos as equally finished products. Include verified outcome/evidence rather than vanity numbers.
- Implement TH/EN canonical resume views and real downloadable `application/pdf` files. At least `ai-automation` and existing retained variants, with a path to `martech` and `product-operations`. PDFs must have selectable text, proper Thai font support and sensible filenames; no broken Google Docs interstitial. Use the same canonical data to drive the site and PDF.
- Add SEO/canonical, per-project OG metadata, sitemap, page performance and keyboard accessibility. Verify indexed static HTML or SSR/prerender rather than assuming a client-side SPA is automatically crawlable.

**LINE OA**
- Add `POST /api/webhooks/line` and the Messaging API adapter (do not create a new OA automatically). Verify `x-line-signature` **against raw request bytes before JSON parsing**. Support empty verification events, duplicate webhook delivery, timing, errors and retry policy. Reply with concise grounded links from the same knowledge version used by EVA.
- Provide `docs/LINE-SETUP.md` with env var names, webhook URL and verification/testing instructions. No actual channel secret or token in docs. Client access via line link does not authorize private data.

**Codex MCP integration**
- Implement a narrowly scoped read-only MCP server/adapter: `search_portfolio`, `get_project`, `get_evidence`, `list_public_projects`, `get_resume_profile`, `suggest_case_study_gaps`. Use official compatible MCP SDK/transport. Require authentication for private/owner scopes, and document Codex configuration. Public search still returns only published materials. Remote MCP requires proper authorization; local stdio MCP may use secured local env values.
- Document tools, JSON schemas, ACL, timeout and tests in `docs/MCP-SETUP.md`. Do not build public shell-execution or write tools by default.

**Deployment, evidence and release**
- Add PostgreSQL migrations, Genesis collection/graph schema manifest, environment example (never real secrets), **Docker Compose for persistent PostgreSQL + GenesisDB + API/worker**, local mock mode, seed/import CLI, API contracts, unit/integration/e2e tests, CI checks, native graph/vector integration tests, telemetry, admin auth, rate limits, backups and runbooks. Verify actual Genesis release/image/binary before pinning. A mock integration cannot satisfy native search acceptance.
- Implement `/api/health` (minimal public) and authenticated `/api/internal/index-health` showing PostgreSQL connection, Genesis reachability, collection index lag/coverage, index generation and outbox backlog without leaking secrets. Separate readiness and liveliness.
- Make a safe Vercel deployment only with correct accessible project/scope and required credentials. If production deployment/account access is missing, finish local/mock setup, build, tests, document the blocker and hand back exact steps. Do **not** claim a live working deployment without checking it.
- At each bounded milestone, provide files changed, what is implemented vs mocked, tests actually run and their outputs, evidence links, risks, and next work. Create small reviewable PRs if the workflow supports them. Do not merge/deploy production or rotate real user credentials without necessary authorization.

## Hard rules

- Implement code and tests, not an endless planning loop. Start with repo audit/security, then work through P1 slices. For unavailable credentials/services, implement a tested mock adapter and continue with nonblocked parts; make external steps explicit.
- Do not rewrite the entire repo or break its existing resume/portfolio/gallery experience without a documented decision and parity check.
- Do not promote source ownership to confirmed personal authorship or draft material to a delivered production success. Separate approved claims from model-inferred hypotheses.
- Do not index private projects into public RAG. Enforce source/asset/chunk visibility on the server and test unpublish/invalidation.
- No secret keys in browser code (`VITE_*` is public), repo, logs, Codex output or screenshots. Use environment variables only in a secure runtime.
- All factual chatbot answers must contain real accessible citations where evidence exists; on insufficient evidence say so.
- All four consumers must use the same shared Knowledge API: PostgreSQL for canonical data/authorization and **GenesisBlockDB for native vector+graph hybrid search**; no duplicated hardcoded facts per channel.
- **Storage invariant:** never import/install pgvector, never use vector columns in PostgreSQL, never run vector cosine/distance SQL, never write another app-managed graph or vector index, and never write Genesis engine's internal SQLite files. A sanctioned worker-owned lexical lane is a separate decision and only after a real proven requirement/capability check.
- **Public retrieval invariant:** every Genesis hit is an untrusted candidate until looked up and authorized in PostgreSQL using the active approved generation. On unpublish or index-version mismatch, deny even if Genesis/caches still contain data. Don't hand unfiltered content to the LLM.
- **Operational invariant:** GenesisBlockDB must have a persistent, authenticated server or verified persistent embedded worker with backup/restore and restart tests. Vercel alone is not a durable embedded DB host.
- Track decisions as ADRs, interfaces as OpenAPI/MCP contracts and acceptance in `docs/ACCEPTANCE-EVIDENCE.md`.

## Required initial output

Before substantive refactors, report a compact **Baseline Findings & Execution Plan**:
1. Current architecture and components to reuse, with file evidence.
2. Top security issues, potential credential exposure and remediation path without disclosing secrets.
3. Source inventory and top 4–6 **candidate** case studies with status/claim gaps.
4. Chosen PostgreSQL + GenesisBlockDB architecture and ADR-002/ADR-007, 5–8 ordered implementation slices, dependencies and tests. Include real native API capability/readiness checks and the outbox/revocation design.
5. Exact first files you will change; then **execute slice 1** rather than waiting indefinitely for a second planning round.

## Required final output

Include: architecture diagram showing **PostgreSQL canonical + Genesis vector/graph hybrid**; implemented REST/MCP contracts; actual PostgreSQL migrations and Genesis node/edge/index manifest; local Compose + persistent production design; outbox, reconciliation and unpublish behavior; native hybrid search tests after restart; screenshots and validated PDF artifact; verified case studies; TH/EN RAG results; an `Implemented / Mocked / Blocked / Not started` matrix; security remediation and evidence/SHAs. Do not claim a mock Genesis adapter is a deployed engine.

**Definition of done:** All **14** acceptance criteria in `PORTFOLIO-KB-PRD-SRS-ARCH-v1.1.md` pass, or are explicitly identified as blockers with reproducible evidence. A beautiful UI without working RAG, approved content, PDF downloads, LINE adapter and secure MCP is **not** done.
