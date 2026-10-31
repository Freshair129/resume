# Thai ASR repair — deployed verification

2026-10-31, Asia/Bangkok. Live page: https://pornpon-quiet-portfolio.vercel.app/voice?lang=th

## Result

Updated the persistent API/worker and ASR model used by the existing Vercel page. The frontend deployment remains `dpl_9eDy6fysoFKFVxmwS5Rkv9Y1Wjmk`; no frontend changes or Vercel environment changes were needed. API and LINE worker use the same final image; exact image IDs and source hashes are in [release-runtime.json](release-runtime.json).

The selected profile is `thai-small-cpu4-beam5-v5`: Thai fine-tuned Whisper Small, CPU int8, four threads, beam five, existing VAD and deadlines. The fixed server glossary contains only `GenesisBlockDB` and `เจเนซิสบล็อกดีบี`, passed through the pinned Lalin worker's native glossary -> faster-whisper `initial_prompt`. The adapter requires the native application receipt when the capability is advertised. There is no fuzzy transcript replacement or public prompt/model control.

Raw Thai transcription remains `เจเนซิสบล็อกดีบีรองรับการค้นหาแบบไหนบ้าง`. AnswerService internally recognizes exact Thai/English spellings of this published project as `GenesisBlockDB` before retrieval and grounding. It detects answer language from the original question first. The visible transcript is unchanged. Genesis books, blockchain references and words such as Antigenesis are not remapped; private-fact guards and SQL reauthorization remain in place.

## Same-input native comparison

[Inputs](inputs.json) contain 12 hashed fixtures: eight Thai utterances (four target-name and four unrelated/confusable controls), two English utterances, silence and deterministic low-level noise. Speech is Windows SAPI synthetic output, including the exact original deployment WAVs. It is not human microphone input.

| Metric | Original Small, no prompt | Thai Small + bilingual name glossary |
| --- | --- | --- |
| Correct complete Thai project name | 0/4 | 4/4 |
| Thai normalized character edit rate | 90/254 = 35.43% | 12/254 = 4.72% |
| Thai unrelated/control character edit rate | 30/127 = 23.62% | 12/127 = 9.45% |
| English control edit rate | 0/42 | 0/42 |
| False project-name insertions into controls | 0 | 0 |
| Silence / noise rejected as NO_SPEECH | 2/2 | 2/2 |
| Successful speech requests | 10/10 | 10/10 |
| Largest observed native request time | 2.96 seconds | 3.27 seconds |

Fresh [baseline](baseline-identified.json) and [selected](selected-identified.json) reports record the actual `/describe` engine, source commit, profile revision, manifest hash, model asset hashes and runtime epoch. [Comparison](comparison.json) uses identical case IDs and WAV hashes. Scoring removes punctuation/spacing and canonicalizes only correctly spelled Thai phonetic and English name variants. The raw selected output spells the name in Thai; 4/4 does not mean four literal English `GenesisBlockDB` outputs. Character rate is not Thai tokenized WER. Timings are host observations, not controlled performance benchmarks. Resident ASR memory was approximately 748 MiB.

## Actual hosted and browser checks

- [Vercel native pipeline](vercel-unedited-final.json): **6 checks PASS_WITH_NATIVE_LOCAL_TTS**. Both languages upload real WAV bytes to local Whisper, then send the **unedited** returned transcript to the shared API. Both receive `grounded_summary`, approved GenesisBlockDB citations and validated Pattara/Zira WAV. Thai transcription took 12.14 seconds and reply 11.22 seconds in this hosted observation; English took 4.23 and 6.22 seconds. Each is a separate bounded request. Private salary refusal has no citations; invalid WAV returns 400.
- [Actual Chrome browser](vercel-browser.json): typed the exact unedited API transcripts, received TH/EN answers and source links, clicked Play and observed advancing media time with `paused:false`, then Stop with `paused:true` and time zero. Clear removed question, citations and audio. No observed console errors. This is browser playback evidence, not browser microphone capture or physical-phone listening.
- [Final default suite](default-suite-final.txt): **107 tests / 102 PASS / 5 opt-in SKIP / 0 FAIL**, 105.6 seconds. [Lint](lint-final.txt) and final Docker/Vite build passed. Fixture tests do not prove native Genesis or ASR quality; the actual engine/hosted reports above are separate.
- Independent read-only review found no Critical/Important issue. Minor model-identity reporting gap was fixed with the fresh identified runs. A second Minor—Thai name-only language detection after normalization—was reproduced RED and fixed by detecting language first; a regression test now covers it. Other RED evidence: [glossary](glossary-red.txt), [name alias](alias-red.txt), [language](language-red.txt).

The IAB controller failed to attach during this retest; actual UI checks used a separate Chrome task tab without changing the user's existing tabs. Full-page capture initially timed out; the visible Thai result and later full English capture succeeded: [Thai screenshot](vercel-th-chrome.png), [English screenshot](vercel-en-chrome.png).

## Failures retained and limits

Initial generic-model prompt candidates are preserved in `glossary-candidate.json` and `glossary-name-only.json`. One dropped leading words; the name-only trial exceeded the ASR deadline, after which the worker's bounded restart temporarily rejected subsequent immediate probes. The worker recovered without an OOM. These are not relabelled as successful acceptance. The earlier Thai-model unprompted comparison and initial glossary comparison remain separate from the fresh identified reruns.

The first actual hosted unedited-transcript attempt correctly transcribed Thai but returned `insufficient_evidence` without citations because the shared service did not recognize the Thai spelling; [that failure](vercel-unedited-first.json) is preserved. Exact name normalization fixed this retrieval/grounding issue, rather than replacing the test's question with a manually corrected English name.

This small, task-focused synthetic corpus was used to select the model/glossary. It is **not a held-out benchmark**, broad Thai/English accuracy claim or physical microphone acceptance. Other Thai names and words still have errors. The transcript remains editable. The upstream generic `qualified:false` quality gate was not overridden. A real phone microphone/listening check remains unverified.

No portfolio facts were approved, no source corpus/index/schema was changed, no credentials were exposed, and no actual LINE message was sent for this repair. PostgreSQL/Genesis/Tailscale volumes and unrelated services were preserved. Temporary evaluator/probe containers were removed; model volumes remain available for rollback.

## Sources and reproduction

- [Thai CTranslate2 model publisher](https://huggingface.co/Thaweewat/whisper-th-small-ct2), revision `fe1f90dcade5fe4f6fa229047c7cf6d939bbb8bb`; publisher declares Apache-2.0, derived from [BioDataLab Thai Small](https://huggingface.co/biodatlab/whisper-th-small-combined).
- Standard multilingual tokenizer from [Systran Small](https://huggingface.co/Systran/faster-whisper-small), revision `536b0662742c02347bc0e980a01041f333bce120`. The Thai conversion omits tokenizer.json; all four asset origins and SHA-256 hashes are in [model-provenance.json](model-provenance.json).
- Native prompting API: [faster-whisper 1.2.1 source](https://github.com/SYSTRAN/faster-whisper/blob/v1.2.1/faster_whisper/transcribe.py). No upstream worker blobs were modified; the pinned Lalin commit remains `d765e14664a73a936666759c13111325df25211d`.
- [Setup and rollback](../../../VOICE-SETUP.md), [repair plan](../../../superpowers/plans/2026-10-31-thai-asr-accuracy.md). `portfolio-api:before-thai-asr`, the saved v4 profile and original Small model volume remain available.
