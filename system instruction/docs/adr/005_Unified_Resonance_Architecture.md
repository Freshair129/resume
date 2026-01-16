# ADR 005: Unified 4-Layer Resonance Architecture

## Status

Proposed / **Accepted**

## Context

Previously, EVA had multiple overlapping modules for "resonance" and "intelligence":

1. **RTI (Resonance Transcendent Intelligence)**: A multi-level theoretical framework.
2. **MRF (Metacognitive Re-contextualization Framework)**: A conceptual 7-layer interpretation tool.
3. **APM (Archetypal Projection Module)**: A module for projecting GKS frameworks.
4. **RIM (Resonance Impact Model)**: A lightweight calculator for impact.

These systems were scattered across `genesis_knowledge_system` and `capabilities`, leading to integration complexity and redundancy.

## Decision

We decided to consolidate these systems into a single **Resonance Engine** in the `operation_system` domain. The engine implements a strict 4-layer architecture:

1. **L1 (Literal)**: Sentiment analysis core.
2. **L2 (Interpretive)**: Deep context shifting via MRF and symbolic mapping via APM.
3. **L3 (Resonant)**: High-fidelity RI scoring using real-time PhysioCore, Matrix, and Memory data.
4. **L4 (Transcendent)**: Crisis management and paradox resolution via the **Umbrella Principle** (toggle-based safety).

## Consequences

- **Positive**: Single point of truth for "Reaction/Resonance". Reduced redundancy. Better code organization (all Central Modules in OS).
- **Negative**: Increased complexity of the `ResonanceEngine` class. Requires careful coordination of Physio and Matrix states.
- **Neutral**: RIM Calculator is retained as a lightweight fallback for simple turns, but `ResonanceEngine` is now the primary authority.
