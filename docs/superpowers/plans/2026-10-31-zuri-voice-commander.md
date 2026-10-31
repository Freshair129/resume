# Zuri Voice Commander Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkboxes for tracking. Owner approved the design and explicitly instructed implementation; continue without another plan-approval round.

**Goal:** Add `/voice` using local Whisper, shared approved-knowledge answers/citations, and explicitly qualified local speech output.

**Architecture:** Browser PCM16 WAV -> exact restricted proxy routes -> Knowledge API -> isolated pinned Lalin ASR worker. Replies reuse AnswerService with a server-private evidence proof rechecked after optional TTS. No change to PostgreSQL/Genesis authority or LINE links.

**Tech Stack:** React/Vite, Node/Express, existing PostgreSQL/Genesis/Ollama, Lalin Python worker in Docker.

**Spec:** `docs/superpowers/specs/2026-10-31-zuri-voice-commander-design.md` (owner approved 2026-10-31).

## Global Constraints

- WAV mono PCM16 16 kHz, maximum 15 seconds / 512 KiB; explicit th/en input language.
- Server-only worker credentials; exact voice routes only; no public arbitrary text-to-speech or worker control.
- ASR deadline 20 seconds; combined answer/TTS bounded within 25-second proxy budget; TTS at most eight seconds.
- No pgvector, new knowledge store, legacy fact approval, external speech provider, or unrelated model unload.
- Public audio requires approved tested voice; preserve failed candidates. Text/ASR can ship independently with truthful unavailable-audio state.
- Preserve existing dirty checkout on feature branch and runtime volumes. No commit of unrelated work. Work in place: current implementation depends on extensive uncommitted authorized platform changes absent from HEAD.

## Review Focus

- A real browser microphone permission denial or navigation while permission is pending must release tracks.
- Silence/noise and malformed WAV must never reach answer generation.
- Revocation during speech synthesis must suppress both text and audio.
- Worker timeout must cancel owned compute and erase bytes, rather than merely abandon a fetch.
- Existing public bridge/LINE boundaries and public credentials must remain intact.

### Task 1: Media and private worker adapter

Files: create `server/voice/wav.mjs`, `server/voice/lalin.mjs`, `tests/voice-worker.test.mjs`; create pinned worker preparation script and Compose overlay under `scripts/` and `infra/`.

Interfaces: `validateVoiceWav(bytes)` returns duration; `LalinVoiceClient.transcribe(bytes,lang,{signal})` returns `{text,language}`; constructor uses private socket/token/profile.

- [x] Write failing tests for WAV limits/headers and real HTTP protocol fixture (discovery, envelope, polling, cancellation, erase, no-speech).
- [x] Run `node --test tests/voice-worker.test.mjs` and observe RED.
- [x] Implement checked media and private worker adapter against pinned contract; prepare isolated worker without modifying source repos.
- [x] Run targeted tests GREEN; qualify actual local ASR TH/EN and silence separately.

### Task 2: Shared answers, voice routes and proxy

Files: modify `server/agent/answer.mjs`, `server/app.mjs`, `server/runtime.mjs`, `server/public/proxy.mjs`; create `server/voice/routes.mjs`, `tests/voice-api.test.mjs`, `tests/voice-proxy.test.mjs`.

Interfaces: `AnswerService.reauthorize(result)` uses server-private proof. `/api/voice/transcribe?lang=th|en` returns transcript JSON; `/api/voice/reply` returns shared answer/citations plus `audio_status`, optional bounded WAV base64.

- [x] Write failing tests for media admission, unavailable worker, private-fact refusal, post-TTS revocation, source/audio binding and proxy method/query/body/type isolation.
- [x] Run tests RED; implement exact routes, deadlines, no-store and global/per-client limits before media parsing.
- [x] Run new and existing answer/proxy/LINE tests GREEN. Keep TTS disabled unless approved provider actually qualifies.

### Task 3: Voice page and microphone lifecycle

Files: create `src/features/voice/VoicePage.jsx`, `voice.css`, `capture.mjs`, `pcm.mjs`; modify `src/App.jsx`, Contact and Privacy copy; create `tests/voice-pcm.test.mjs`.

Interfaces: `startCapture({onLimit})` returns `{stop():Promise<Uint8Array>,cancel()}`; page calls the two public endpoints, renders citations, and owns abort/audio resources.

- [x] Write meaningful PCM clipping/downsampling/bounds tests, observe RED, implement and verify GREEN.
- [x] Implement mobile/keyboard accessible states, editable transcript, explicit language, click-to-record/play and text fallback. Release resources on hide/route exit/clear.
- [x] Run lint/build and actual browser checks: route/nav, bilingual copy, pending microphone permission cancellation/text request, citations, narrow viewport, preserved LINE CTA. Physical phone voice and actual permission-denial handling remain separate unverified device cases.

### Task 4: Real runtime, TTS qualification and deployment

Files: `scripts/verify-voice-runtime.mjs`, docs/evidence/voice reports, `docs/VOICE-SETUP.md`, environment example, architecture/OpenAPI updates.

- [x] Build isolated pinned Lalin worker, hash assets and select private credentials without printing them. Measure CPU ASR on this host.
- [x] Preserve installed Qwen TTS failure; inspect/test eligible local TTS only. Owner selected Pattara/Zira after listening; actual host/Docker synthesis and hosted playback passed.
- [x] Build candidate API, preserve rollback tag, recreate only owned services needed, verify health/projects/LINE guards and actual shared native answers.
- [x] Deploy prebuilt Vercel output with secret scan; verify actual hosted `/voice` text and ASR requests. Record native source evidence separately from fixture tests and physical-phone/listening acceptance.

### Task 5: Verification and independent review

- [x] Run default suite, lint/build, scoped whitespace checks; record test skips honestly.
- [x] Fresh-context reviewer checks this feature's complete change set and spec; fix important findings with regression tests.
- [x] Update implementation ledger with implemented/verified/blocked distinctions and deliver actual URLs/evidence. No claim of fully working spoken TH/EN until TTS and listening gates pass.

## Execution rulings and progress

- Owner design approval covers starting UI/ASR before public TTS is available. No repeated approval request is needed for those reversible implementation steps.
- Existing checkout and feature branch are retained; a worktree from HEAD would omit the authorized uncommitted platform. No stash/reset/commit/branch change will be used to obtain a misleading clean baseline.

## Verified progress checkpoint (2026-10-31)

- Task 1: media and worker protocol RED/GREEN; pinned 22-file source, model SHA-256 verification, private CPU worker running. Real synthetic TH/EN clips transcribed, silence rejected; technical-name error in Thai retained. Natural-microphone accuracy is not accepted.
- Task 2: exact voice API/proxy paths and source proof implemented. SQL revocation after synthesis suppresses text/audio. Fixture HTTP tests prove raw-media bounds, cancellation across both hops, and admission retained until old work settles. Actual candidate API reached approved corpus/native Genesis/Ollama before TTS addition.
- Task 3: voice page, nav, Contact and Privacy implemented; desktop and 375px local built-page inspection completed. Microphone permission remained pending in IAB and Clear restored input. No physical capture is claimed. DOM audio element added for actual playback verification after final build.
- Task 4: owner listened and chose Windows Pattara/Zira. Dedicated loopback TTS host and Docker client generated both languages; native cancellation/reuse passed. Current-user hidden logon task is registered/running. Final API/Vercel build and hosted full-flow verification remain pending at this checkpoint.
- Task 5: initial complete suite 96 tests / 91 pass / 5 skip, lint/build passed before TTS addition. Fresh reviewer identified proxy cancellation and premature reply admission release; both reproduced RED and fixed GREEN. The additional TTS language mismatch was reproduced RED and fixed in both override directions. Final suite must be rerun after all additions.

### Rulings and review disposition

- Retain the existing feature checkout rather than create a HEAD-only worktree; otherwise the uncommitted platform would be missing. Cost: feature review must scope files explicitly rather than assume a clean branch diff.
- The owner’s implementation approval authorizes reversible setup/deployment steps without another plan gate. No unrelated changes are committed or reset.
- Pending permission cleanup was regraded Important because leaving the page must close AudioContext promptly. Lifecycle regression reproduced RED and passed after cleanup registration moved before asynchronous startup.
- External cancellation is not an Ollama provider failure: regression reproduced RED and fixed so visitor Clear cannot open the provider health circuit.
- Full TTS PCM validation was required before enabling the new provider; provisional magic-byte checking was replaced and corrupt/truncated/oversized output cases pass.
- Minor deferred: worklet final partial-buffer flush (about 43 ms at 48 kHz); authenticated incomplete host request may occupy capacity until eight-second HTTP timeout; private host health is liveness and not independent per-voice readiness. These do not expose public arbitrary synthesis or change knowledge authorization.

- Native crash-recovery probe found Windows PowerShell returned a null cached child ExitCode as success. This owned pre-promotion host failure is retained in `tts-recovery-before.json`; watcher now treats any unexpected server exit as failure so the configured scheduler retry can work. Actual restart verification follows separately.
- Private host health was renamed to `live` so it does not claim per-voice readiness; actual native synthesis is the readiness evidence.

- Sizing ruling: turbo CPU exceeded the fixed production deadline under current host load. Beam-one turbo plus Linux asset volume did not close that gate. Use the smaller pinned Whisper model in profile `small-cpu4-beam5-v4` and its own immutable model volume. Cost: potentially weaker transcription; preserve editable text, recognition-error evidence and no broad accuracy claim. Same-fixture Small native timing is about 3–5 seconds and memory about 744 MiB; full hosted acceptance is recorded separately.

## Final deployed checkpoint (2026-10-31)

- Production deployment dpl_9eDy6fysoFKFVxmwS5Rkv9Y1Wjmk is READY at https://pornpon-quiet-portfolio.vercel.app/voice. Native Vercel checks: six PASS; existing hosted API regression: 53 PASS. Actual browser TH/EN source links, audio playback/stop and Clear passed; no observed console errors.
- CPU Small beam-five is the selected profile. Owner-selected Pattara/Zira synthesis, Docker access and owned-process watchdog recovery passed. Earlier turbo timeouts and failed Windows startup/watchdog probes are retained separately.
- Review findings are fixed and documented in docs/evidence/voice/VOICE-VERIFICATION.md. No commit, push, legacy approval or database migration was performed for this slice.
- Final default-suite confirmation is recorded separately from native integration evidence. One earlier final rerun hit the local Ollama fixture timeout; its isolated retest passed without a product change. Preserve that failure rather than relabel it.
- Remaining external acceptance: physical-phone microphone capture/listening and real browser permission denial. Owner has been asked to test. Synthetic uploaded recordings and viewport/playback checks do not close those cases. Thai technical-name recognition errors remain, and the transcript is editable before submission.

- Final confirmation completed: 101 tests / 96 pass / 5 opt-in skip / 0 fail, 115.3 seconds. Lint and deployed production build passed. The intermittent preceding fixture failure is retained in the verification report.
