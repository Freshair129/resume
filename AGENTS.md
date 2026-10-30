# Repository Guidelines

## Project Structure & Module Organization

Run commands from this repository root (`F:/resume/app` on this machine).

- `src/`: React UI; portfolio and voice features live under `src/features/`.
- `server/`: Knowledge API, retrieval, channel adapters, indexing workers, PDF and speech services. `api/` contains Vercel handlers.
- `postgres/migrations/`: ordered SQL migrations; `infra/`: Docker and pinned runtime configuration.
- `public/`: distributed assets; `content/`: catalog inputs and quarantined legacy material.
- `tests/`: automated checks; `scripts/`: operational utilities; `docs/`: architecture, runbooks and verification evidence.

## Build, Test, and Development Commands

Use Node.js 24 and install dependencies with `npm ci`.

- `npm run dev`: start Vite; `/api` requires the configured persistent backend.
- `npm run build` / `npm run preview`: build and inspect production assets.
- `npm start` / `npm run worker`: run the API or durable indexing/LINE worker.
- `npm run migrate`: apply PostgreSQL migrations to the configured database.
- `npm test`: run Node tests serially. `npm run lint`: run ESLint.
- `npm run mcp`: start the authenticated MCP adapter.

## Coding Style & Naming Conventions

Use ES modules, PascalCase React components, camelCase functions and `*.test.mjs` test filenames. Match adjacent indentation: typically two spaces in JSX and compact indentation in server modules. Preserve existing formatting; avoid unrelated rewrites. ESLint config targets JavaScript/JSX; validate server `.mjs` changes through tests and syntax checks.

## Testing Guidelines

Use `node:test` and strict assertions; browser suites use Playwright. Run a focused test with `node --test tests/voice-worker.test.mjs`, then the full suite. PostgreSQL integration requires `TEST_DATABASE_URL`; browser checks require `RUN_BROWSER_TESTS=1` and a production build. Report skipped suites explicitly. Fixtures cannot establish native Genesis search, hosted delivery or physical microphone acceptance.

## Architecture & Security

Read `docs/ARCHITECTURE.md` and ADR-002 before architecture changes. PostgreSQL is canonical; GenesisBlockDB provides native vector/graph hybrid retrieval. Never install pgvector. Preserve transactional outbox indexing, idempotency and publication reauthorization. Channels share AnswerService. Host Genesis persistently, outside ephemeral Vercel Functions.

Keep credentials in ignored `.env.local`/`.runtime/` files. Never publish private inventories or unapproved legacy claims. Preserve unrelated checkout changes and runtime volumes.

## Commit & Pull Request Guidelines

Follow history's imperative `feat:` / `fix:` subjects. Keep commits focused. PRs should explain behavior, reference relevant issues, list validation and remaining gates, and include screenshots for UI changes.

## Local Ollama Coding

Default to `mellum:latest`; consult `C:/Users/suanr/.ollama/benchmarks/MELLUM_MODEL_SELECTION.md`. Check `ollama list` and `ollama ps`. Before benchmarks, unload unrelated models and run one model at a time.
