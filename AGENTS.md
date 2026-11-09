# AGENTS.md — shared rules for every agent in this repository

Applies to Claude (lead) and to Codex workers alike. Role-specific behaviour lives in
[`docs/codex-workflow.md`](docs/codex-workflow.md); this file holds the rules that do
not change with role.

## Project in one paragraph

Personal portfolio and resume site for Pornpon Thanasuwannathan (บอส), positioned for
HR and hiring managers. Vite 7 + React 19 + Tailwind 4 SPA, deployed on Vercel.
Serverless endpoints live in `api/` (Web-standard `Request -> Response` handlers).
Chatbot is proxied to Gemini server-side. Visitor data (chat logs, leads) is stored
in Supabase. UI is bilingual TH/EN via `src/data/translations.js`.

## Commands

```
npm run dev      # Vite dev server; /api/* served by middleware in vite.config.js
npm run build    # production build, must pass before any handoff
npm run lint     # eslint; known pre-existing errors in src/SpotlightReveal.jsx only
```

## Hard rules

1. **Secrets stay server-side.** Never add a `VITE_` prefixed secret. Never commit
   `.env`. Server env vars must be whitelisted by prefix in `vite.config.js` so
   local dev can read them.
2. **Database access only from `api/`.** The Supabase client is created in
   `api/_lib/` with the service-role key. Nothing under `src/` imports it.
3. **No commits, pushes or branch switches by workers.** The lead or the owner commits.
   Commit messages end with the attribution line the host provides.
4. **One writer per file set.** Two agents never edit the same file in the same task.
   The router assigns files per subtask; stay inside your list.
5. **Evidence over prose.** A check is passed only when `evidence.md` shows the command,
   its exit code and output. "Should work" is not a result.
6. **Fail fast.** Run the cheapest check first: lint, build, unit, curl, browser.
   Stop at the first failure.
7. **Personal data is PDPA-scoped.** Store only what the visitor typed. No IP
   addresses in the database. Every collection point shows a TH/EN notice.
   See [`docs/data-retention.md`](docs/data-retention.md).
8. **Do not change positioning copy** in `src/data/profile.js` or the hero layout in
   `src/App.jsx` unless the brief says so explicitly.
9. **No new UI libraries, no TypeScript.** Plain JS, Tailwind utilities, `motion/react`,
   `lucide-react` are the toolkit.
10. **Respect loop caps.** implement 2, test 2, review round trip 1. Then write
    `BLOCKED` and stop; a blocked task is cheaper than a spinning one.

## Risk levels (summary; full table in docs/codex-workflow.md)

- **S**: 2 files or fewer, nothing under `api/`, `supabase/`, `.env*`, `vite.config.js`.
- **M**: 3 to 6 files, or UI + logic, or anything in `src/chatbot/`.
- **L**: anything touching `api/`, `supabase/`, `.env*`, `vite.config.js`, auth,
  rate limiting or personal data storage.

Level decides model effort, test tier and which gate reviews the work. Spend follows
risk, never role.

## Handoff format

Each task has a folder `.codex/tasks/<YYYYMMDD-slug>/` with `brief.md`, `plan.md`,
`evidence.md`, `review.md`, `summary.md`. Templates are in `.codex/tasks/_template/`.
The lead reads `summary.md` only; it opens the diff when the status is
`ACCEPTED_WITH_NOTES` on a level-L task or any check is `NOT VERIFIED`.

## Documents

- `docs/codex-workflow.md` — roles, model routing, pipeline, role prompts.
- `docs/data-retention.md` — what visitor data is stored, where, and deletion policy.
- `EVA_BACKEND_SETUP.md` — optional external chatbot backend.
- `.env.example` — every environment variable, with comments.

## Verification before handoff

Run `npm run build` and `npm run lint`. Diff the working tree against the files allowed
in `brief.md`; anything outside that list is reverted or explained in `summary.md`.
