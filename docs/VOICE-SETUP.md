# Zuri Voice Commander

Owner approved the local-model design on 2026-10-31. `/voice` uses the existing Knowledge API; no browser/vendor recognition service, pgvector or second knowledge store is added. The [design](superpowers/specs/2026-10-31-zuri-voice-commander-design.md) and [reuse audit](design/2026-10-31-voice-reuse-audit.md) define the boundaries.

## Implemented interface

- `POST /api/voice/transcribe?lang=th|en`: raw mono PCM16 16 kHz WAV, maximum 15 seconds and 512 KiB. Returns `{text,language}`. Silence returns 422 `NO_SPEECH`; unavailable/busy speech returns 503. Invalid media is rejected before inference.
- `POST /api/voice/reply`: strict JSON `{message,lang}`, 1–2,000 characters, th/en. Returns the existing approved answer/citations with `audio_status`. No public arbitrary text-to-speech, model selection, worker management or file-path API.
- Initial TTS uses owner-selected Windows Pattara (th) / Zira Desktop (en), synthesized on this PC. `audio_status: available` includes a validated WAV; errors, long source excerpts or failed synthesis return `unavailable` while preserving approved text/citations. No claim of neural F5 quality is made.
- All responses use `no-store`. Client Clear/navigation cancellation crosses Vercel and the persistent bridge, cancels the owned worker operation, and requests erasure. Response admission remains occupied until any uncancellable answer work settles. External cancellation does not trip Ollama's provider-health circuit.

## Reproducible local preparation

Run from `F:/resume/app`. No changes to FUNG or Lalin checkouts are required.

```powershell
node scripts/prepare-voice-worker.mjs
node scripts/prepare-voice-assets.mjs
node scripts/configure-voice-worker.mjs
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File scripts/start-voice-tts.ps1
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File scripts/install-voice-tts-startup.ps1
docker build -f infra/voice-worker.Dockerfile -t portfolio-voice-asr:d765e146 .runtime/voice-worker/src
node scripts/stage-voice-model-volume.mjs
docker compose --env-file .runtime/compose.env -f infra/docker-compose.yml -f infra/docker-compose.voice.yml up -d --no-deps voice-asr
```

The source-preparation script downloads only 22 allowlisted Git blobs from Lalin commit `d765e14664a73a936666759c13111325df25211d` and verifies their Git SHA-1 identities from `infra/voice-source.json`. Optional command-line arguments are local source mirrors; files are used only when the expected blob hash matches. No Git partial-clone repair is required. Runtime source is ignored, not bundled into the website.

The model-preparation script downloads revision-pinned Whisper Small assets separately and validates every SHA-256 against the explicit manifest. The runtime cannot fetch models: no network, offline flag, read-only model mount. Preserve source/model receipts in ignored `.runtime/voice-worker/` for reproduction.

The dedicated worker has no TCP listener/network, uses a shared Unix socket, four CPU threads/CPUs, a 4 GiB memory cap with no additional swap, and an ephemeral private data directory. API gets socket-group access and only its inference token. Never publish the socket, worker token, management endpoints or raw Ollama endpoint through Funnel/Vercel.

Build a new API image and apply the API image selection together with `infra/docker-compose.voice.yml`; this overlay adds the private token env file/socket mount to API only. Keep the existing Funnel overlay and any image overrides needed for the running stack. Do not run `--remove-orphans` or remove PostgreSQL/Genesis/Tailscale volumes.

## Retention and boundaries

Raw recordings are erased after ASR; the client adapter deletes the worker receipt payload after reading the transcript. Failed/aborted attempts receive cancel then erase with independent one-second cleanup budgets. Abandoned payloads have a 30-second TTL and a portfolio lifecycle wrapper sweeps every two seconds, including when idle. `/data` is tmpfs, so container replacement discards residual engine-control receipts. The wrapper sweeps on startup before loading the model. These records are not canonical portfolio metadata or knowledge authorization.

Question/answer content remains in browser page memory. It is never ingested into the approved knowledge corpus. AnswerService stores an evidence proof in a WeakMap, not serialized JSON; reauthorization against current PostgreSQL rows happens after optional synthesis and before returning audio/text. Revoked evidence returns 409 without either.

The aggregate public voice quota is 15 requests/minute per API process; ASR and reply concurrency are each bounded to one. Behind the bridge this deliberately does not trust visitor forwarding headers for independent user quotas. This is a shared small-host capacity limit, not a distributed per-user quota service.

## Verification and remaining gates

```powershell
node --test tests/voice-worker.test.mjs tests/voice-api.test.mjs tests/voice-proxy.test.mjs tests/voice-cancel.test.mjs tests/voice-capture.test.mjs tests/voice-pcm.test.mjs
npm test
npm run lint
npm run build
$env:VOICE_CHECK_URL='http://127.0.0.1:3103'
$env:VOICE_CHECK_REPORT='docs/evidence/voice/candidate-api.json'
node scripts/verify-voice-runtime.mjs
```

`verify-voice-runtime.mjs` requires locally generated synthetic test WAVs under `.runtime/voice-worker/question-th.wav` and `question-en.wav`. It uses the real worker, approved corpus/native Genesis and shared AnswerService, not fixture search. A visitor can edit a transcription before sending. The initial deployment used a manually corrected question because its technical name was misrecognized. Set VOICE_USE_TRANSCRIPT=1 for a new check that sends the exact unedited transcript to AnswerService. Neither path proves physical microphone accuracy.

- Source protocol fixtures and lifecycle unit tests are separate from real engine checks.
- OS-synthesized TH/EN recordings prove transport/inference execution; silence is rejected. They do not prove natural microphone or broad Thai/English transcription quality.
- Physical mobile microphone capture and audible playback require a separate actual device test.
- Installed Ollama TTS-named tag failed both speech-output requests. Lalin F5's shipped sample is `dev-only` and its profile is Thai-only. Do not enable that sample publicly.
- Windows Pattara/Zira samples under `docs/evidence/voice/` were presented to the owner, who explicitly chose these public presets on 2026-10-31. They are basic OS speech synthesis, not neural F5. Native host and Docker-to-host generation are recorded separately from hosted browser playback.
- Deferred: worklet drops the final partial 2,048-sample buffer (about 43 ms at 48 kHz); flush/ack can refine this. The provisional speech magic check was replaced with full bounded PCM/container validation before enabling Windows TTS.

Rollback: retain `portfolio-api:before-voice`, select it for API without touching database/tunnel volumes, disable/remove only the voice overlay when appropriate, then rerun public project/chat checks. The earlier API ignores new voice routes; the frontend must display unavailable rather than fake results during rollback.

## Windows TTS host

The host binds only `127.0.0.1:11436`; Docker Desktop reaches it at `host.docker.internal`. A separate random server token protects `/speech` before body reading; input permits only text/language, never client-selected voices or commands. Text is passed as UTF-8 JSON over stdin to PowerShell 7. System.Speech uses its documented [SetOutputToAudioStream](https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtoaudiostream?view=netframework-4.8.1) API; raw PCM is wrapped and fully validated as mono PCM16 24 kHz WAV. No text/audio files are persisted by this host. Citation markers are removed before speaking, without rewriting factual content. The answer-language policy, including explicit override requests, selects the voice.

The 6.5-second host synthesis deadline kills only the owned PowerShell process; client and API deadlines are independently bounded. Native cancellation followed by a fresh successful synthesis is recorded. The current-user `Portfolio-Zuri-TTS` logon task runs hidden, has no stored password or elevation, and runs a two-second script watchdog with at most three early-exit retries. The private env file captures the absolute PowerShell 7 path so it does not depend on Codex’s interactive PATH after login. Task registration/running state has been checked; reboot/logon acceptance is not implied. The fallback installer uses a current-user Startup shortcut only if Task Scheduler is unavailable and uses the same bounded script watchdog without depending on Scheduler-level retries.

Known minor limits: private `/health` reports only operational liveness, not independent voice readiness; native synthesis tests are the voice-readiness evidence. An authenticated incomplete request body can occupy the host until the eight-second HTTP timeout rather than the 6.5-second synthesis budget; it cannot select commands/models or exceed the body cap. These do not expose a public TTS endpoint.

## Host sizing decision: Whisper Small

Initial large-v3-turbo CPU trials transcribed the synthetic fixtures, but two production-path checks exceeded the unchanged 20-second ASR budget and were cancelled; these failures remain in `vercel-native-voice.json`, `production-local-voice.json` and `vercel-native-voice-v2.json`. A beam-one turbo trial and Linux model volume improved startup behavior but did not remove the deadline failures. They are not presented as successful production acceptance.

The initial profile was `small-cpu4-beam5-v4`: Systran/faster-whisper-small at revision `536b0662742c02347bc0e980a01041f333bce120`, CPU int8, four threads, VAD, beam five. That rollback profile is retained in `infra/voice-asr-small-profile.json`; its files were verified in a dedicated external Docker volume (`portfolio-intelligence_voice-small-models`) rather than read across the Windows model-cache bind mount during inference. The old turbo cache/volume remain available for rollback; no database volume is changed.

On the same synthetic clips, the Small beam-five probe took 4.6 seconds (Thai) and 3.1 seconds (English), with about 744 MiB resident worker memory versus about 1.86 GiB in the turbo run. This is a hardware sizing observation, not a controlled speech-quality benchmark. The synthetic Thai technical name and the word for search still contain recognition errors; the transcript is deliberately editable and the answering check uses a corrected question. No general Thai accuracy or physical-microphone acceptance is claimed.

Small is a deliberate accuracy/resource tradeoff for this six-core PC while other applications remain running. Larger-model failures are preserved rather than hidden by increasing visitor timeouts or unloading unrelated applications. The private API pins `VOICE_WORKER_REVISION`; a stale profile/epoch is rejected, not silently accepted.

## Thai recognition repair (v5)

Current profile `thai-small-cpu4-beam5-v5` uses [Thaweewat/whisper-th-small-ct2](https://huggingface.co/Thaweewat/whisper-th-small-ct2), the CTranslate2 conversion of BioDataLab Thai Small, at immutable revision `fe1f90dcade5fe4f6fa229047c7cf6d939bbb8bb`. CPU int8 / four threads / beam five and visitor deadlines remain unchanged. The conversion omits tokenizer.json, so the manifest separately pins the standard multilingual tokenizer from Systran Small revision `536b0662742c02347bc0e980a01041f333bce120`; all assets and their individual origins are hashed. Model binaries are non-executable CTranslate2 data; no remote model code or new package is loaded. The publisher declares Apache-2.0; model/source links and actual probe results are recorded in the repair report.

The dedicated Docker model volume is `portfolio-intelligence_voice-thai-small-models`. `prepare-voice-assets.mjs` and `stage-voice-model-volume.mjs` accept an optional explicit profile path for reproduction/rollback. The old Small/turbo models and volumes are preserved. The adapter sends only the fixed spelling glossary `GenesisBlockDB` / `เจเนซิสบล็อกดีบี` through Lalin’s advertised native glossary API. It checks the native applied receipt; unsupported runtimes retain unprompted transcription. Public callers cannot choose prompts or terms. Returned transcripts are not rewritten or fuzzily corrected.

Reproduce synthetic fixtures with `node scripts/prepare-voice-evaluation.mjs`; run `scripts/evaluate-voice-asr.mjs` in the API image with a private UDS and `/evaluation` mount. The evaluator records the observed worker/profile/engine/source identity and asset hashes, input hashes, raw outputs and glossary receipts. `scripts/summarize-voice-asr.mjs` compares named reports using Unicode-character edit distance; correctly spelled phonetic/English name variants are canonicalized only for scoring. This is not Thai WER or a population-level benchmark. See [repair verification](evidence/voice/thai-asr/THAI-ASR-VERIFICATION.md).

For rollback, select `portfolio-api:before-thai-asr`, the saved `voice-asr-small-profile.json`, revision `small-cpu4-beam5-v4` and volume `portfolio-intelligence_voice-small-models` together, then recreate only API/voice-asr with the existing private environment and Funnel overrides. Do not delete model/database volumes or reconfigure LINE.
