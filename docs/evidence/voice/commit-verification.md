# Voice ASR commit verification

2026-10-31, Asia/Bangkok. These checks cover the isolated backend prerequisite and Thai-repair source trees, rather than the complete pending Portfolio implementation.

## Exact scope

The owner authorized a separate prerequisite commit because the previous Git HEAD contained neither the Knowledge API nor Voice backend. See [commit scope](../../VOICE-COMMIT-SCOPE.md). The original frontend and Netlify dependency remain; pending Portfolio/Voice UI routing, private inventories, content imports, credentials, runtime files and model binaries are excluded. The existing deployed Voice page was not redeployed.

Prerequisite tree: `6c9c8a4eae4ebdda768ee82d59e46fde8ae75073`. Repaired code/evidence tree before adding this report and raw check logs: `53910d699b3a6f92e362e10474ba3ef008dd49a9`. Final additions are documentation/logs only; executable sources and dependency lock are unchanged from the tested candidate.

## Fresh checks

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | npm ci --ignore-scripts completed; isolated node_modules | [Install](commit-checks/install.txt) |
| Prerequisite npm test | 89 pass, 2 skip, 0 fail / 91 tests | [Log](commit-checks/foundation-tests.txt) |
| Thai repair npm test | 95 pass, 2 skip, 0 fail / 97 tests | [Log](commit-checks/thai-tests.txt) |
| Production build | PASS, preserved original frontend | [Build](commit-checks/build.txt) |
| Scoped ESLint | PASS: changed JS files and Vite proxy config | [Log](commit-checks/scoped-lint.txt) |
| Full ESLint | 5 existing react-hooks/refs errors in unchanged src/SpotlightReveal.jsx:91 | [Failure retained](commit-checks/lint-preexisting.txt) |
| Secret patterns / paths | PASS: no tracked secret env/runtime files, production bundle scan | [Log](commit-checks/security.txt) |
| Source syntax / fixtures | 79 MJS files parse; 12 committed WAV hashes match manifest | Source and fixture hashes checked independently |

The two opt-in skips are the external PostgreSQL and native Genesis integration suites. These Node tests do not establish live native search, ASR accuracy or phone acceptance. Full lint remains an explicit existing frontend gate; its source blob is identical to the previous Git HEAD, and its pending fix is outside this task. No new test/build failure was hidden. An earlier Thai candidate run was interrupted during a tool-session replacement and had neither an exit code nor a suite summary; its [partial log](commit-checks/thai-tests-interrupted.txt) is retained and is not counted as passing.

Versions retained for the original tools: Vite 7.3.1, Netlify CLI 23.13.3. Runtime locks include pg 8.23.1, Express 5.3.0, express-rate-limit 8.7.2, MCP SDK 1.32.2, Zod 4.6.7. No pgvector dependency was added.

## Historical runtime evidence and newline provenance

[Thai ASR deployed verification](thai-asr/THAI-ASR-VERIFICATION.md) and its native A/B, Vercel API and browser receipts describe the earlier deployed runtime/full implementation worktree. Its 107-test result is historical; the smaller exact-commit result is the table above. The 12 synthetic clips were used for model selection and are not a held-out or natural-speech benchmark. Physical phone microphone/listening remains NOT_RUN. No live channel, database, model or deployment retest was performed during this commit task.

Preserve release-runtime.json exactly as observed. Five of its six source hashes match Git blobs directly. The deployed/worktree answer.mjs has one CRLF newline normalized by Git: raw SHA-256 `cb3586bbaf0b1ce8f31144a2e3a241e66cbdcc75ea839c39af1425f00b8307c6`; committed LF SHA-256 `ca886180fe8a7b5a06ebbc4b0339bb1997036e7e5b971b87b4e9a920a84cf005`. Replacing CRLF with LF makes the contents byte-identical. This is newline normalization, not a different deployed logic implementation.

Historical runner logs retain their original trailing spaces. Scoped whitespace checking passes when those immutable raw TXT receipts and the vendored Genesis patch are excluded. Two screenshots were inspected before publication and show only the public Voice page. Pattern scanning plus review found no credentials in new non-test text; fake security-test tokens remain fixtures. Removing the tracked legacy .env does not erase its already-remote history.

## Reproduction

Run npm ci, npm test, npm run build, node scripts/security-check.mjs, and npm run lint from a clean checkout. Full lint currently reports the existing error above. Real runtime checks additionally require the private configured services described in VOICE-SETUP.md. To reuse the exact synthetic original questions for verify-voice-runtime.mjs, copy thai-asr/fixtures/th-original.wav and en-original.wav into ignored .runtime/voice-worker/question-th.wav and question-en.wav respectively, then set VOICE_USE_TRANSCRIPT=1. Never copy runtime credentials or model binaries into version control.
