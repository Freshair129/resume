# ADR-003: Biological Trigger Perception & Catalog Integration

## Status

Accepted

## Context

In EVA 9.1.0, the "Bio-Digital Gap" flow requires accurate translation of semantic user input into physiological stimulus vectors. Previously, the LLM generated these vectors (valence, arousal, intensity) purely based on its own reasoning with broad semantic tags. While flexible, this led to inconsistent physiological responses (e.g., varying adrenaline spikes for similar levels of "threat").

The system already possesses a comprehensive `stimulus_spec_ml.yaml` defining pre-validated biological triggers (e.g., `acute_threat`, `social_validation`) and their specific hormonal impacts.

## Decision

We decided to integrate the `stimulus_spec_ml.yaml` catalog directly into the LLM's Phase 1 (Perception) context.

1. **Catalog-Aware Perception**: The LLM is now provided with the Stimulus Catalog in its Phase 1 prompt.
2. **Tool Schema Update**: The `sync_biocognitive_state` tool now accepts a `stimulus_id`.
3. **Authority-Led Resolution**: The Context Injection Module (CIM) acts as a "Cognitive Firewall." If the LLM provides a `stimulus_id`, CIM resolves it against the YAML catalog and hydrates the stimulus vector with pre-defined biological impacts.
4. **Override Support**: The LLM can still provide custom `bio_impacts` and `stimulus_vector` to handle edge cases not covered by the catalog.

## Consequences

### Positive

* **Physiological Consistency**: Biological reactions are now tied to standardized triggers.
* **Reduced Hallucination**: The LLM doesn't have to "guess" chemical impacts; it only needs to "identify" the stimulus.
* **Easier Tuning**: System behavior can be tuned by editing the YAML catalog without modifying the LLM prompt or code.

### Negative

* **Prompt Bloat**: The Stimulus Catalog adds tokens to the Phase 1 prompt (mitigated by truncation and top-N trigger selection).
* **Schema Rigidity**: The LLM is now encouraged to "fit" perception into pre-defined categories.
