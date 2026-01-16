# ADR-006: Hybrid GraphRAG Architecture

## Status

Accepted

## Date

2026-01-11

## Context

EVA 9.1.0's memory system required a significant upgrade to move beyond simple semantic search (Vector RAG).
The system needs to retrieve memories not just by "keyword similarity" but by:

1. **Causal Chains**: What event triggered this state?
2. **Biological Resonance**: Retrieving memories that "feel" the same (Bio-State similarity), even if the topic is different.
3. **Knowledge Application**: Tracking which skills (GKS) were used in an episode.
4. **Phenomenological Texture**: Retrieving memories with similar "Qualia" (AQI).

Pure Vector RAG (ChromaDB) cannot efficiently handle structure, causality, or complex numerical filtering (Bio-State vectors).

## Decision

We adopted a **Hybrid GraphRAG** approach using **Neo4j** alongside **ChromaDB**.

### 1. The Stack

* **Neo4j (Graph Database)**: Stores the *structure* of memory (Nodes, Relationships, Causality).
  * Holds `EPISODE`, `BIO_STATE`, `CONCEPT`, `STIMULUS`, `MASTER_BLOCK`, `GENESIS_BLOCK`, `QUALIA` nodes.
  * Handles "Graph Traversal" and "Bio-Resonance" (Euclidean search on 16D Bio-Vectors).
* **ChromaDB (Vector Store)**: Stores the *content* embeddings.
  * Holds text embeddings (768D) for high-speed semantic retrieval.
  * (Future) Might be replaced if Neo4j's native vector search proves sufficient, but enabling Hybrid now allows reliability.

### 2. Schema Integration (GKS & AQI)

The Graph Schema is not just a log; it is a **Knowledge Graph**.

* **GKS Integration**: Explicitly maps Episodes to the Skills (`GENESIS_BLOCK`) and Essence (`MASTER_BLOCK`) used. This allows EVA to "know what she knows".
* **AQI Integration**: Maps Episodes to `QUALIA` nodes, preserving the "subjective texture" of experience.
* **Trauma Flag**: Explicit indexing of `trauma_flag` allows high-priority recall of negative events for safety and psychological continuity.

### 3. Database Location

* Moved Neo4j storage to `E:\The Human Algorithm\T2\eva_core\eva\memory\graph_store\` to leverage larger storage and centralize all EVA data.

## Consequences

* **Positive**:
  * Enables complex queries ("Find episodes where I used Empathy and felt anxious").
  * Unifies Memory (RMS), Knowledge (GKS), and Feeling (Matrix/AQI) in one graph.
  * Trauma events are immediately accessible.
* **Negative**:
  * Adds complexity (must maintain both Neo4j and Chroma).
  * Requires migration of existing JSON logs to Graph.

## References

* `docs/GRAPH_SCHEMA_DESIGN.md`
* `docs/NEO4J_MOVE_TO_E_DRIVE.md`
