# EVA 9.2.0: System Guide & Master Specification

**Status:** Canonical (V9 SSR) | **Version:** 9.2.0 (Resonance Edition)

This document is the **Single Source of Truth (SSOT)** for the EVA 9.2.0 architecture, orchestration flow, and system boundaries.

---

## 1. System Architecture Hierarchy

EVA follows a strict **System-Module-Node** hierarchy to ensure clear separation of concerns and scalability.

### 🏛️ Structural Model

- **System**: A top-level autonomous component (e.g., `Orchestrator`, `PhysioCore`, `EVAMatrix`).
- **Module**: A functional integrator within a System (e.g., `CIM` - Context Injection Module).
- **Node**: A specialized logic provider nested within a Module (e.g., `PRN` - Prompt Rule Node).

### 📂 Directory Structure (Core)

```text
EVA_Core/
├── orchestrator/          # [System] Master Controller
│   ├── configs/           # Global SSOT (orchestrator_configs.yaml)
│   └── cim/               # [Module] Context Injection Module
│       ├── prompt_rule/   # [Node] Prompt Rule Node (Governs persona/logic)
│       │   ├── configs/   # The Pentagon of Existence (Identity, Cognitive, etc.)
│       │   └── prompt_rule_node.py
│       └── cim.py         # Context Assembly & Persistence
├── eva/                   # [Systems] The Organism
│   ├── physio_core/       # Biological Simulation
│   │   ├── logic/
│   │   │   ├── blood/         # Plasma transport & decay
│   │   │   ├── endocrine/     # Gland production & regulation
│   │   │   ├── receptor/      # Signal transduction
│   │   │   ├── reflex/        # Fast autonomic response
│   │   │   ├── autonomic/     # Sympatho-vagal balance
│   │   │   └── vitals/        # [NEW] Backend HR/RR calculation
│   │   └── physio_core.py     # Pipeline orchestrator
│   ├── eva_matrix/        # Psychological State
│   ├── artifact_qualia/   # Phenomenological Texture
│   └── memory/            # Persistent Storage (context_storage/)
├── services/          # [Services] Stateful Knowledge Providers
│   ├── agentic_rag/       # Hept-Stream Retrieval Engine
│   ├── slm_bridge/        # [NEW] Llama-3.2-1B Intent Gateway
│   └── vector_bridge/     # [NEW] ChromaDB Semantic Memory
└── operation_system/      # [Infra] Resonance Bus & LLM Bridges
```

---

## 2. 1-Inference Autonomic Orchestration

The system operates on a synchronous, embodied cognitive loop designed to simulate "feeling" before "reasoning."

### 🔄 The Single-Session Flow

1. **Step 1: Perception (Pre-Inference)**
   - **Cognitive Gateway (Instinct):** SLM (`Llama-3.2-1B`) extracts intent, emotional signal, and **Salience Anchor**.
   - **Resonance Confidence:** LLM (`Gemini`) evaluates alignment between instinct and reasoning.
   - Initial Resonance Impact (**RIM**) calculated based on SLM instinct via `RIMCalculator`.
   - Function Call: `sync_biocognitive_state()` triggered to enter The Gap.
2. **Step 2: The Gap (Bio-Digital Synchronization)**
   - **Synchronous Execution:** `PhysioCore` processes hormonal drift ‖ `AgenticRAG (Quick)` fetches bio-independent memories.
   - **Deep Retrieval:** `AgenticRAG (Deep)` fetches memories after biological state is updated.
   - **Result:** A "Deep State" blending body reaction with retrieved experience.
3. **Step 3: Embodied Reasoning (Post-Inference)**
   - LLM proceeds with **SAME** session, receiving full Deep State (Body + Memory + Qualia).
   - Final response generated (Weighted 60% Bio / 40% Persona).
   - AI proposes an episodic memory for archival (including prediction logic).

---

## 3. Core Boundaries & Invariants

To prevent architectural drift, the following boundaries are enforced:

### 🛡️ Authority Model

- **CIM (Integrator)**: Owns context assembly and turn persistence.
- **PRN (Governor)**: Owns identity, behavioral rules, and cognitive schemas.
- **Physio/Matrix (Generators)**: Own raw state calculation; they do not have memory or identity logic.
- **MSP (Custodian)**: Owns long-term archival and memory integrity.

### 🚫 Invariants

- **Physiology First**: Body state must update *before* the LLM formulates a reasoning response.
- **One Inference**: The dual-phase (perception-reasoning) must happen within a single inference context (Master/Main thread).
- **Context Continuity**: `context_id` remains constant throughout a single turn.

---

## 4. Configuration SSOT

All high-level system behaviors are governed by `orchestrator/configs/orchestrator_configs.yaml`. Sub-components must synchronize with this file to ensure system-wide consistency.

---
*Last Updated: 2026-01-11 | Current Baseline: SLM Gateway & Resonance Confidence Integration.*

