# Voice Commander: FUNG and Lalin-AI reuse audit

Checked 2026-10-31 (Asia/Bangkok). This is a source audit and a small installed-TTS capability probe, not a working voice deployment or a new ASR quality benchmark.

## Evidence boundary

GitHub connector resolved current default-branch commits:

| Repository | Inspected remote main | Local checkout inspected only as secondary context |
| --- | --- | --- |
| Freshair129/FUNG | `090daac989c13412d4079b251f00fabd317ecbaa` | `G:/AI-Studio/development/FUNG`, HEAD `4950696c607c5b77eaba3840b2413ab4702beee2` |
| Freshair129/Lalin-AI | `d765e14664a73a936666759c13111325df25211d` | `E:/lalin`, HEAD `61151edf69c5d0e66acaa976c6be42ca4fb46a47`; `G:/AI-Studio/Lalin-Studio`, HEAD `64212b1010e93e57709a4daa5ec75317113c33ba` |

These local checkouts differ from remote main. Recommendations below use pinned remote files; local branch work is not represented as merged. Lalin-AI means the Studio/voice-worker repository, not Lalin Play or Lalin Cast.

## What can be reused

### Lalin-AI: strongest starting point for the speech service

- [Headless worker HTTP boundary](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/apps/api/app/voice_worker/app.py): authenticated operation submission, status, cancellation, output retrieval and payload erasure. This is a separate entry point; it does not require launching Studio.
- [Runtime](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/apps/api/app/voice_worker/runtime.py): idempotency receipts, target/profile checks, bounded capacity and deadline watchdog. The caller still owns admission and resource scheduling; the worker is not a global GPU scheduler.
- [ASR profile](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/apps/api/profiles/voice-worker/asr-th-en-01.json): large-v3-turbo, CPU int8, explicit `th`/`en`, VAD, concurrency one, pinned assets. Auto detection was removed following documented Thai-to-English hallucination failures.
- [Docker example](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/docker/voice-worker/compose.example.yaml): private Unix socket, separate ASR/TTS runtimes, resource caps, read-only model mounts. Inference operations must not be exposed directly through Funnel or Vercel.
- [ASR evidence](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/docs/validation/2026-09-21-HEADLESS-VOICE-WORKER-SLICE-B-ASR.md) and [Linux evidence](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/docs/validation/2026-09-22-HEADLESS-VOICE-WORKER-SLICE-C-LINUX.md) document real engine work, non-speech rejection, CPU/container sizing and limits. These historical measurements are not tests run on the current portfolio host today. The documents retain older checkpoints and open gates; do not flatten them into a blanket production approval.

Important differences from a plug-and-play integration:

1. New caller credentials, profile/epoch discovery, operation envelopes, polling, cancellation and erase are required. The full private worker contract is not a public browser API.
2. The example ASR accepts WAV/MP4/OGG and other listed types, but not a generic `audio/webm` contract. Browser microphone capture needs a deliberate PCM/WAV conversion or a separately tested decode path.
3. This host is an i7-8700K with about 32 GiB RAM and RTX 3060 12 GiB. The repository's eight-thread CPU sizing came from an i7-14700KF; it cannot be copied as this host's benchmark.
4. Only the medium Whisper cache was found in the checked shared Hugging Face cache. No turbo/F5 model directory was found at the checked local Lalin asset locations. This does not prove assets do not exist elsewhere.

### FUNG: useful transcription and adapter patterns

- [Persistent transcriber](https://github.com/Freshair129/FUNG/blob/090daac989c13412d4079b251f00fabd317ecbaa/scripts/transcribe_live.py): load Whisper once, JSON-lines requests, VAD, independent chunks with `condition_on_previous_text=False`, relative timestamps, per-chunk failure without discarding the worker.
- [TTS configuration](https://github.com/Freshair129/FUNG/blob/090daac989c13412d4079b251f00fabd317ecbaa/src-tauri/src/tts_config.rs) and [executor](https://github.com/Freshair129/FUNG/blob/090daac989c13412d4079b251f00fabd317ecbaa/src-tauri/src/tts_executor.rs): provider types, deadlines and WAV validation. These are desktop Rust adapters, not a hosted speech model or a browser endpoint.
- [Architecture](https://github.com/Freshair129/FUNG/blob/090daac989c13412d4079b251f00fabd317ecbaa/docs/Desktop/ARCHITECTURE.md) describes desktop-owned capture and knowledge custody. Preserve the portfolio's different canonical PostgreSQL authority; do not import FUNG's application persistence architecture.

Use the persistent-model, cancellation/error and output-validation lessons. Running the entire FUNG application or exposing its desktop API would add recording/meeting/database responsibilities unnecessary for public portfolio questions. FUNG's app/PID loopback capture and installed-package gates do not establish browser microphone acceptance.

## TTS findings that affect delivery

- [Lalin's shipped preset](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/apps/api/profiles/voice-worker/tts-th-preset-01.json) is `languages: ["th"]` and `rights_status: "dev-only"`. Its own note says never use that sample voice as a production preset.
- [TTS evidence](https://github.com/Freshair129/Lalin-AI/blob/d765e14664a73a936666759c13111325df25211d/docs/validation/2026-09-22-HEADLESS-VOICE-WORKER-SLICE-B-TTS.md) records historical real F5 synthesis, Linux GPU smoke and an owner model-rights decision D9. It separately leaves the production speaker recording unresolved. That earlier project's model decision does not grant rights to the unknown sample speaker or qualify English output for this portfolio.
- The worker accepts `dev-only` as a known profile status for development. A public portfolio adapter must explicitly require an approved voice; a worker accepting a preset ID is insufficient authorization for public use.
- XTTS is not the Thai path; Lalin's model card also records a non-commercial limitation. No XTTS dependency is proposed.
- Current Ollama CLI/server version: **0.40.13**. `ollama show` reports the installed `hf.co/mradermacher/qwen-tts-thai-sft-GGUF:Q4_K_M` with `completion` and `audio` capabilities.
- Two actual `POST /v1/audio/speech` calls, one Thai and one English, both returned **400**, `does not support speech`. No audio was produced. See [probe evidence](../evidence/voice/installed-tts-probe.json). Model naming and an `audio` capability do not prove audio output.
- [Current Ollama documentation](https://docs.ollama.com/api/openai-compatibility#v1-audio-speech) documents speech output for supported speech models, so the historical Lalin note that Ollama has no audio output is outdated as a general platform statement. The installed tag still failed the live speech endpoint.
- The [GGUF card](https://huggingface.co/mradermacher/qwen-tts-thai-sft-GGUF) points to [3scale's source card](https://huggingface.co/3scale/qwen-tts-thai-sft). Neither card is evidence of successful audio output from this installed Ollama tag or adequate Thai/English quality here.

The probe did not unload other models, alter Ollama configuration or deploy any route. `ollama ps` was empty before it. No existing portfolio/LINE container was recreated or stopped.

## Recommendation

Reuse a pinned, isolated **Lalin headless ASR worker** behind a small Portfolio API adapter. Apply FUNG's persistent-model/output-validation patterns where relevant. Keep answer generation in the existing AnswerService: PostgreSQL publication checks, native Genesis vector+graph retrieval, Ollama Qwen summarization and citations.

Qualify TTS as a separate bounded step. F5 can be evaluated locally with the documented development preset, but public use requires a documented approved voice, a qualified TH/EN profile and actual playback tests. The installed Qwen tag is a failed candidate, not the production default. Finish source-grounded text and ASR work independently; never claim the full spoken TH/EN experience is ready while TTS is unavailable.

## Subsequent owner decision and native TTS check

After the initial audit, the owner heard Windows Pattara/Zira samples and selected them for initial public speech. A dedicated authenticated loopback Windows SAPI host now generates real TH/EN WAV audio, including from the Docker client. See `../evidence/voice/windows-tts-host.json`, `windows-tts-docker.json` and `windows-tts-cancel.json`. The failed Ollama candidate and F5 dev-only limitations remain recorded; Windows speech does not establish F5/Ollama speech capability or natural-microphone accuracy.
