# ADR 008: Memory Architecture Centralization (Subconscious Consolidation)

## Status

Accepted - 2026-01-13

## Context

As EVA evolves toward a commercial/plugin-based model, the distinction between **"Lived Experience"** (User-specific memory) and **"Innate Knowledge"** (General AI personality/frameworks) became critical. Prior structures had overlapping responsibilities for memory storage across GKS, MSP, and Qualia.

## Decision

We will centralize all **Dynamic Persistence** into **MSP (Memory & Soul Passport)**.

1. **MSP as the Subconscious:** All working memory (Episodic, Semantic Situation Grounding, Sensory Qualia) is moved to MSP during session consolidation.
2. **GKS as the DNA:** GKS remains the owner of "Master Blocks" (Frameworks, Concepts, Protocols). It is Read-Only during standard runtime and does not store user-specific lived events.
3. **Crosslinking:** MSP uses IDs (Weak References) to point to GKS Frameworks. If GKS is unplugged (Downgraded Tier), the memory remains readable but lacks deep theoretical context.

## Consequences

- **Positive:** Improved data consistency. Safer backup/migration of user personality. Support for multi-tiered GKS models.
- **Positive:** Clearer "Doc-to-Code" boundaries for memory handling.
- **Negative:** MSP logic becomes more complex (3000+ lines monolithic engine), requiring future internal modularization.
