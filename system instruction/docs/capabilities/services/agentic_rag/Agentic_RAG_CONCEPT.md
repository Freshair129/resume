# Agentic RAG: Conceptual Overview

**Component ID:** `SYS-ARAG-8.2` | **Version:** `8.2.0` | **Date:** 2026-01-05

## 1. Core Philosophy: Embodied Memory Retrieval

Agentic RAG departs from traditional RAG by prioritizing **embodied memory retrieval**. Instead of purely semantic or keyword-based search, it integrates EVA's current physiological and psychological state to recall memories that are emotionally and physically congruent. This simulates how organic beings often recall experiences based on their current "felt sense."

The system operates on the principle that EVA's current internal state (from Physio Core, EVA Matrix, Artifact Qualia) significantly biases what memories are most relevant and accessible.

## 2. The Hept-Stream Retrieval Architecture

Agentic RAG simultaneously queries seven distinct "streams" of memory, each tuned to retrieve a specific aspect of EVA's past experience. The results from these streams are then weighted and fused to form a comprehensive memory context.

### A. Stream Descriptions

Each stream focuses on a unique dimension of memory:

* **1. Emotion Stream (CRITICAL)**:
  * **Purpose**: Retrieves memories whose associated physiological and psychological states (ANS, hormones, 9D matrix) are similar to EVA's *current* state.
  * **Mechanism**: Cosine similarity matching between current state vectors and archived state vectors.
  * **Impact**: Crucial for "felt sense" consistency and preventing emotionally dissonant responses.

* **2. Narrative Stream**:
  * **Purpose**: Recalls sequential chains of episodic memories, maintaining story continuity and chronological flow.
  * **Mechanism**: Graph-based traversal of linked episodic nodes.
  * **Impact**: Ensures EVA's responses are consistent with her ongoing story.

* **3. Salience Stream**:
  * **Purpose**: Prioritizes memories tagged with high Resonance Impact (RIM) scores, indicating events of significant emotional or experiential importance.
  * **Mechanism**: Filter by RIM score and recency.
  * **Impact**: Brings up "important" past events that shaped EVA.

* **4. Sensory Stream**:
  * **Purpose**: Retrieves memories based on similarity to current phenomenological qualia (texture, tone, intensity).
  * **Mechanism**: Vector similarity matching on 5D qualia vectors.
  * **Impact**: Recalls "how things felt" rather than just "what happened."

* **5. Temporal Stream**:
  * **Purpose**: Recalls memories based on recency and temporal proximity to the current interaction.
  * **Mechanism**: Exponential decay function, prioritizing memories within a 30-day half-life.
  * **Impact**: Provides context from recent interactions.

* **6. Intuition Stream**:
  * **Purpose**: Utilizes semantic graph patterns to infer connections and retrieve conceptually related knowledge or patterns.
  * **Mechanism**: Graph traversal, semantic embedding similarity.
  * **Impact**: Facilitates "sudden insights" or recognition of familiar patterns.

* **7. Reflection Stream**:
  * **Purpose**: Retrieves meta-cognitive insights, learning outcomes, or self-evaluations from past experiences.
  * **Mechanism**: Specialized tags or attributes in episodic memory.
  * **Impact**: Contributes to EVA's self-awareness and learning.

### B. Weighted Fusion

The results from each stream are weighted (configured in `Agentic_RAG_configs.yaml`) and fused. The **Emotion Stream** often carries the highest weight due to its critical role in embodied cognition.

## 3. Integration with the Orchestrator (CIM)

Agentic RAG is a key component of the Orchestrator's Phase 2 (Reasoning) context injection.

### A. Input

Agentic RAG receives a `query_context` from the CIM, which includes:

* `tags`: Keywords or entities extracted from the user input.
* `ans_state`: Current Autonomic Nervous System state.
* `blood_levels`: Current hormone concentrations.
* `context_id`: The unique ID for the current turn.

### B. Output

Agentic RAG returns a list of `memory_matches`, each containing:

* `episode_id`: ID of the matching memory.
* `content`: The retrieved memory snippet.
* `score`: Relevance score.
* `stream_source`: The stream from which it was retrieved.
* `metadata`: Contextual data (timestamp, resonance index, original tags, physio snapshot).

This output is then incorporated by the CIM into the final prompt for the LLM.

## 4. Infrastructure & Persistence

Agentic RAG relies on:

* **Vector Database**: Typically a local FAISS index (`consciousness/02_Semantic_memory/faiss_index`) for fast similarity search of memory embeddings.
* **Graph Database**: (e.g., Neo4j) for narrative and intuition stream traversal.
* **MSP Client**: For direct access to raw memory stores (episodic, semantic, sensory).

## 5. Performance Goals

* **Latency**: Target < 800ms for a comprehensive retrieval cycle.
* **Accuracy**: High emotional congruence (Emotion Stream matching > 70%).
* **Scalability**: Efficient indexing and querying for large memory archives.

---

## Related Documentation

* **Agentic RAG Configuration**: `configs/Agentic_RAG_configs.yaml`
* **Memory & Soul Passport (MSP)**: `memory_n_soul_passport/README.md`
* **Context Injection Module (CIM)**: `orchestrator/cim/README.md`
* **Resonance Bus Architecture**: `docs/SYSTEM_OVERVIEW.md`
