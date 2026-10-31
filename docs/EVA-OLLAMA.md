# EVA local Ollama summaries

Owner authorized the current PC and direct Ollama on 2026-10-30. Vercel and Tailscale continue serving the existing frontend/private API. No cloud inference, LiteLLM, vLLM, embedding migration or new vector store is introduced.

## Answer boundary

`POST /api/chat` -> native Genesis vector + graph retrieval -> canonical SQL authorization -> bounded Ollama context -> structured output validation -> fresh SQL snapshot authorization -> server-built citations.

Website and LINE share AnswerService; MCP continues returning authorized structured evidence. Only SQL-approved public chunks enter inference. Up to five chunks (2,200 characters each) retain retrieval rank after SQL reauthorization. If the question explicitly names a canonical project title, context is narrowed to that project's already-authorized native hits; this is context selection, not another search index. Source text is untrusted data, with no tools, browsing or commands. The model emits at most one concise sentence with source IDs and exact supporting quotations; technology names remain in English within Thai prose. The server checks schema, language, normalized quote inclusion, source IDs, generated-link/markup exclusion and supported Unicode decimal-number strings. Citation URLs come exclusively from SQL. Any context text, title, URL, source, generation, epoch or provenance change during inference invalidates the whole answer, including fallback.

These checks do not formally prove semantic entailment, catch every number spelled as words, or eliminate all hallucination/injection risk. Actual source relevance and translation need separate evaluation. Empty model sentences abstain rather than returning unrelated results. Profile/private refusals occur before inference.

## Server configuration and budgets

```dotenv
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_CHAT_MODEL=qwen3.5:9b
```

Host development uses loopback. HTTP origins are limited to loopback/Docker host alias; no embedded URL credentials or redirects. Native Ollama is not added to the public bridge. No prompt/upstream-body logging is added.

- Native `POST /api/chat`, `stream:false`, `think:false`, JSON-schema `format`.
- Context 8,192 tokens; output 384 tokens; temperature zero; 12-second generation deadline; response at most 65,536 bytes.
- One in-flight generation per process, no queue/retries; three transport/schema failures open a 30-second circuit.
- Private startup warmup allows 60 seconds and accepts native `done_reason:load`; public completions require `done_reason:stop`. Visitor deadlines are unchanged.
- `keep_alive:-1` retains the selected model until unloaded/server stopped. This reserves GPU memory between visits. Existing BGE-M3 embedding model/dimension remain unchanged.
- Frontend timeout remains 20 seconds, proxy 25 seconds, function 30 seconds. Busy/invalid/failed generation returns explicitly labelled original excerpts after reauthorization (`source_excerpt`, `summary_unavailable`). Validated synthesis returns `grounded_summary`.
- An empty initial response to an open search-approach question may receive one documented-design follow-up when an explicitly named canonical project has approved architecture evidence. The server checks publication again before that call and after generation; the answer is qualified as documented design (`status:documented_design`). Missing numeric/personal facts, closed feature requests and unrelated evidence do not receive this substitution. Both calls share the original 12-second synthesis-stage budget; a follow-up needs at least 8 seconds remaining. The adapter clamps every per-call deadline to its own ceiling. No new knowledge is published by this path.
- Limits are per API/worker process, not a global GPU scheduler. Other desktop applications can still contend for Ollama; a shared Hub becomes useful for cross-application scheduling.

## GitHub audit and benchmark selection

| Actual source | Finding and use here |
|---|---|
| [Hub provider](https://github.com/Freshair129/local-llm-hub/blob/main/runtime/local_llm_hub/providers.py), blob `76782c482e81f05b1f8d9b0a75014849195cf243` | Provider boundary, bounded response, no redirects and redacted errors. Apply these patterns without adding its Python service. |
| [Hub scheduler](https://github.com/Freshair129/local-llm-hub/blob/main/runtime/local_llm_hub/scheduler.py), blob `4d8abcec4334641b5e68878a707a122da73529c3` | Endpoint leases, bounded queue and finally-release. Useful if multiple clients later share one inference service. |
| [Hub benchmark catalog](https://github.com/Freshair129/local-llm-hub/blob/main/src/data/benchmark_catalog.json), blob `e9286e7e92a507c7bf0d93c8e053d0c2a0cb24df` | 45 runs with evidence hashes, actual hardware and calibration/confirmation separation. Use measured evidence within its limits. |
| [Matched installed-model comparison](https://github.com/Freshair129/local-llm-hub/blob/main/docs/benchmarks/reviews/matched-local-ollama-models-2026-10-15.md) | Mellum2.1 leads the measured Rust/HumanEval+ coding comparison on RTX 3060. Preserve the user's Mellum coding default; EVA summarization is a different task. |
| [PRP composition root](https://github.com/Freshair129/Private-Runtime-Platform/blob/main/apps/control-api/src/prp/entrypoints/wiring.py), blob `e5535058895fb5b4829a01ce0e332edc179f54c8` | Explicit M3 skeleton: inference ports remain unbound and fail closed. Not a working provider dependency today. |

The installed Qwen3.5 9B weight SHA-256 matches Hub's benchmark model: `dec52a44569a2a25341c4e4d3fee25846eed4f6f0b936278e3a3c900bb99d37c`. This establishes weight identity, not equivalent performance/settings.

Hub's Qwen GENERAL baseline scored 4/6 combined FR-002/FR-006; baseline confirmation 3/6. The `presence_penalty:1.5` tuned profile scored 6/6 calibration and 5/6 confirmation, recorded as confirmed bounded gain. It uses thinking, 40,960 context/32,768 output tokens and RTX 5060 Ti 16 GB; confirmation median is about 92 seconds. These are coding tasks and cannot be copied into a synchronous 20-second web-chat budget. EVA retains the installed same-weight model with thinking disabled and smaller budgets, subject to real public TH/EN evaluation. No model download or unrelated model unload was performed.

## Deploy, rollback and verification

Candidate image: `portfolio-api:ollama-candidate`; retained rollback: `portfolio-api:pre-ollama`. Ignored `.runtime/compose.env` supplies settings and existing secrets. Ignored `.runtime/ollama-compose.override.yml` selects API/worker image only.

```powershell
docker compose --env-file .runtime/compose.env -f infra/docker-compose.yml -f .runtime/ollama-compose.override.yml up -d --no-deps api worker
```

Do not use `--remove-orphans`: the public gateway/Tailscale belong to the Funnel Compose overlay. Database volumes/tunnel remain intact. Frontend and Vercel proxy code are unchanged; this backend feature requires no Vercel source upload or redeploy.

Rollback selects `portfolio-api:pre-ollama` in the ignored override, recreates API/worker only and reruns public verification. The previous runtime ignores the added variables and returns source excerpts. Never restore/reset database volumes for a provider rollback.

```powershell
npm test
npm run lint
npm run build
$env:PORTFOLIO_REQUIRE_LLM='1'
$env:PORTFOLIO_EVIDENCE_PATH='docs/evidence/vercel/live-api-ollama.json'
node scripts/verify-public-deployment.mjs
node scripts/evaluate-ollama-public.mjs
```

Real hosted/browser results are recorded separately under `docs/evidence/vercel`. Protocol fixture tests do not prove native Genesis retrieval or semantic grounding. This slice does not close whole-volume recovery, physical mobile, live LINE, profile approval or historical credential-revocation gates.
