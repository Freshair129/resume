# ADR-005: Cognitive Gateway & Resonance Confidence Architecture

## Status

Proposed (2026-01-11)

## Context

The EVA 9.1.0 system requires a fast, instinctual "First Impression" (System 1) to mimic human cognitive reflexes. Previous iterations relied solely on the main LLM (Gemini) or smaller models like Qwen-0.6b, which either introduced latency or lacked the nuance necessary for complex languages like Thai (e.g., sarcasm, jealousy).

## Decision

We are implementing a specialized **Cognitive Gateway** layer using **Llama-3.2-1B** via Ollama.

1. **System 1 (Instinct):** The SLM extracts high-level intent, emotional signals, and a "Salience Anchor" (the specific trigger phrase) in under 6 seconds.
2. **Resonance Confidence:** The SLM's output is injected into the Main LLM's (Gemini) Perception phase as an "Intuitive Gut Feeling."
3. **Self-Reflection:** Gemini is instructed to evaluate its deep reasoning (System 2) against this instinct and produce a `confidence_score` (0.0 - 1.0).

## Consequences

- **Improved Realism:** EVA now exhibits a "First Impression" vs. "Deep Reasoning" dichotomy.
- **Traceability:** Cognitive dissonance (when instinct and reasoning clash) is now explicitly tracked via the confidence score.
- **Latency:** Initial latency is increased by ~5-6s due to the SLM call, but this is offset by the improved quality of the "The Gap" processing.
- **Resource Usage:** Requires a local Ollama instance running Llama-3.2-1B.
