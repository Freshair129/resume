# Thai ASR accuracy repair

Owner request: improve Thai transcription, especially GenesisBlockDB, and retest the deployed Voice page. This is a bounded repair to the approved Voice design; implement inline without another design approval round.

Initial hypothesis: the pinned Lalin worker supports an ASR glossary -> faster-whisper 1.2.1 initial_prompt, but our adapter omits it. Actual A/B found omitted words and one deadline failure, so a glossary alone is not accepted. Compare a pinned Thai fine-tuned Small model of the same size next. Preserve GPU use, deadlines, corpus approval, TTS and frontend layout.

Approaches: prefer the native decoder glossary if actual same-input A/B improves entity recognition without false insertions. Larger models cost latency and previously missed deadlines. Fuzzy post-replacement can corrupt unrelated words, so it is excluded.

- [x] Preserve synthetic reference clips and hash every input. Measure baseline versus a short fixed glossary on identical WAVs: target name, other Thai questions, confusable names, English, silence and noise. Record raw transcripts and normalized Unicode-character error rate (not Thai WER or human accuracy).
- [x] Add failing adapter tests for trusted server glossary delivery, absent capability fallback, no client-controlled prompt and truthful application receipts. Implement only a measured winning glossary. Never rewrite the transcript after decoding.
- [x] Run targeted tests, default suite and lint. Build/recreate only the portfolio API if needed; preserve rollback and all unrelated dirty changes. No DB migration or new dependency.
- [x] Test actual Vercel transcription, feed the unedited returned Thai transcript into shared answers and verify approved citations plus Pattara audio. Verify live Voice browser reply/playback and existing exact proxy restrictions. Synthetic uploads are separate from real microphone acceptance.
- [x] Record before/after results and remaining recognition/device limits. No broad Thai-accuracy claim from these synthetic clips.

Review focus: unsupported glossary capability; worker says glossary was not applied; empty/noisy input hallucinates name; unrelated Genesis references become database questions; cancellation still deletes audio; technical-name normalization used only for evaluation and never product output.

## Final disposition

- Native glossary alone on generic Small did not meet the goal; selected pinned Thai Small plus bilingual name glossary after same-input native probes. No GPU, added dependency, deadline increase or fuzzy ASR rewrite.
- Added exact project-name normalization inside the shared AnswerService after actual Vercel unedited Thai initially returned insufficient evidence. API and LINE worker now share image `portfolio-api:voice-thai-v5-final`; no live LINE messages sent. Language is detected before name normalization.
- Reviewer Minor identity-reporting and language-order issues addressed; RED/GREEN captured. Final suite: 107 tests / 102 pass / 5 opt-in skip / 0 fail; lint/build pass.
- Fresh identified native A/B: target names 0/4 -> 4/4; normalized Thai CER 35.43% -> 4.72% on eight synthetic utterances, with no false insertion and two no-speech rejections. These clips were used for selection, not a held-out benchmark.
- Actual Vercel native six checks PASS_WITH_NATIVE_LOCAL_TTS using unedited transcripts. Actual Chrome TH/EN answers, citations, playback, Stop and Clear pass; no console errors. IAB attachment failed, so Chrome was used. Physical microphone and phone listening remain NOT_RUN.
- Evidence: docs/evidence/voice/thai-asr/THAI-ASR-VERIFICATION.md. Rollback model/image preserved; no commits, database migrations, knowledge approvals or unrelated service changes.
