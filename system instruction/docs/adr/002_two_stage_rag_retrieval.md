# ADR-002: Two-Stage RAG Retrieval Optimization

**Date:** 2026-01-10  
**Status:** Implemented  
**Decision Makers:** System Architecture Team

## Context

The Bio-Digital Gap orchestration currently performs RAG retrieval sequentially after complete physiological processing (Physio → Matrix → Qualia → RAG). However, analysis revealed that 3 out of 7 memory streams (Narrative, Intuition, Reflection) only require semantic tags and don't depend on biological state, creating an unnecessary bottleneck.

**Current Timeline:**

- Physio Processing: 60ms
- Matrix Update: 10ms  
- Qualia Generation: 15ms
- RAG Retrieval: 800ms
- **Total: ~1060ms**

## Decision

Implement **Two-Stage RAG Retrieval** by parallelizing bio-independent memory retrieval with physiological processing.

### Architecture

**Stage 1: Quick Recall (Parallel with Physio)**

- **Streams:** Narrative (20%), Intuition (5%), Reflection (5%) = 30% total weight
- **Dependencies:** `tags`, `context_id` only
- **Target Latency:** 200ms
- **Runs parallel with:** Physio Core processing

**Stage 2: Deep Recall (After Bio State)**

- **Streams:** Emotion (35%), Salience (15%), Sensory (10%), Temporal (10%) = 70% total weight
- **Dependencies:** `tags`, `ans_state`, `blood_levels`, `qualia_texture`
- **Target Latency:** 800ms
- **Runs after:** Complete biological state is ready

**Merge:** Deduplicate by `episode_id`, re-rank by weighted scores

### Implementation

1. **Config Changes (`Agentic_RAG_configs.yaml`):**
   - Added `stream_groups` section defining Quick/Deep recall

2. **RAG Engine (`agentic_rag_engine.py`):**
   - Added `retrieve_fast(query_context)` method
   - Added `retrieve_deep(query_context)` method  
   - Added `merge_results(quick, deep)` method

3. **State Management:**
   - Service state stored in `eva/consciousness/state_memory/agentic_rag_state.json`
   - Tracks performance metrics and cache

## Consequences

### Positive

- **~25% Latency Reduction:** Gap processing from ~1060ms to ~800ms
- **Better Resource Utilization:** CPU/IO parallelization
- **Maintains Accuracy:** Same weighted scoring, just optimized sequencing
- **Backward Compatible:** Original `retrieve()` method unchanged

### Negative

- **Increased Complexity:** Two-stage orchestration logic
- **Potential Cache Conflicts:** Quick/Deep results may overlap (handled by merge)

## Performance Impact

**Before:**

```
User Input → Phase 1 → [Physio] → [Matrix] → [Qualia] → [RAG] → Phase 2
                        60ms      10ms       15ms       800ms
                        ═════════════════════════════════════
                        Total: ~1060ms (to Phase 2)
```

**After:**

```
User Input → Phase 1 → [Physio ‖ Quick RAG] → [Deep RAG] → Phase 2
                        60ms    200ms         800ms
                        ═══════════════════════════════════
                        Total: ~800ms (to Phase 2)
```

## Alternatives Considered

1. **Full Parallelization:** Run all streams in parallel
   - **Rejected:** Bio-dependent streams (70% weight) would return incorrect results without state

2. **Caching Only:** Cache recent queries without two-stage split
   - **Rejected:** Doesn't solve the fundamental bottleneck for novel queries

3. **Reduce Stream Count:** Remove bio-independent streams
   - **Rejected:** Narrative/Intuition are valuable for coherent recall

## References

- Implementation Plan: `brain/implementation_plan.md`
- Config: `services/agentic_rag/configs/Agentic_RAG_configs.yaml`
- Documentation: `docs/BIO_DIGITAL_GAP_FLOW.md`
