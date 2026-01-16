# ADR 004: Adoption of 1-Inference (Single-Session) Architecture

* **Status:** Accepted
* **Date:** 2026-01-10
* **Context:** EVA Core Refactoring (Resonance Edition)

## Context

The previous "3-Phase / Multi-Turn" architecture (calling LLM separately for Phase 1, Phase 2, Phase 3) caused significant issues:

1. **Context Fragmentation:** The LLM "forgot" its own thoughts between calls because each Phase was a new API request (non-stateful).
2. **Latency:** 3 sequential LLM calls created unacceptable delays (>10s).
3. **Complexity:** Managing state transfer between phases (passing JSON blobs) was error-prone.

## Decision

We decided to shift to a **"1-Inference / Single-Session"** architecture.

### Logic Flow

1. **Step 1 (Pre-Inference):**
    * Orchestrator initiates **ONE** chat session.
    * Injects `Phase 1 Context` (Perception).
    * LLM calls `sync_biocognitive_state` (Stimulus Extraction).
2. **Step 2 (The Gap):**
    * Orchestrator executes the function *locally*.
    * Calculates Bio-State, RAG (Deep Recall), and updates Matrix.
3. **Step 3 (Post-Inference):**
    * Orchestrator sends the function result back to the **SAME** LLM session.
    * LLM generates the final response and calls `propose_episodic_memory`.

## Consequences

### Positive

* **Context Continuity:** The LLM retains full awareness of the conversation history and its own thought process (from Step 1).
* **Speed:** Reduced round-trips; "The Gap" happens instantly on the local CPU.
* **Simplicity:** No need to reconstruct context for Phase 2; the session holds it.

### Negative

* **Token Load:** The single session context grows longer (User Input + Function Result + Final Response).
* **Dependency:** Requires the LLM Provider to support "Function Calling" and "Chat Session" persistence robustly (mitigated by our Text Fallback).

## Related Changes

* Renamed phases to **Steps** (Pre-Infer, Gap, Post-Infer).
* Introduced **Cognitive Gateway (SLM)** plan for Pre-Inference tagging.
