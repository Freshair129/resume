# EVA Final Boundary Specification

Version: 1.1.0  
Applies to: EVA Architecture ≥ 9.1.0-C3  
Status: Canonical / Publishable

---

## 1. Purpose

This document formally defines the **final authority and boundary model** of the EVA system.
It exists to make ownership, responsibility, and time-direction **unambiguous**, enforceable,
and resistant to future architectural drift.

This specification is normative.
Anything that contradicts it is considered a **system-level fault**.

---

## 2. Core Invariant

> **EVA owns lived memory.**  
> **MSP protects frozen memory.**  
> **No component may cross its boundary.**

---

## 3. System Actors

| Actor | Role |
|------|------|
| EVA | Cognitive entity and owner of lived experience |
| MSP | Memory OS and archival custodian (stateless) |
| Systems | Specialized organs (Physio, Matrix, Qualia) emitting signals |
| Services | Stateful providers (AgenticRAG) managing external layers |
| Orchestrator | Central System owning Modules (CIM) and Nodes (PRN) |

---

## 4. Memory Domains & Ownership

| Domain | Path | Owner | Mutability |
|------|------|-------|------------|
| Live Consciousness | `eva/consciousness/` | EVA | Mutable |
| Context Storage | `eva/memory/context_storage/` | CIM | Mutable (Turn-only) |
| State Memory (H9) | `eva/consciousness/state_memory/` | Matrix | Append-Only (JSONL) |
| Archival Memory | `eva/memory/archival_memory/` | MSP | Immutable |

Ownership is **absolute** and must never be inferred implicitly.

---

## 5. Final Boundary Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────┐
│                         USER                            │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────┐
        │    LLM Core       │
        │ (Reasoning Only)  │
        └─────────┬─────────┘
                  │  (no memory write)
                  ▼
        ┌──────────────────────────────┐
        │        ORCHESTRATOR          │
        │  (Control / Routing / Policy)│
        └─────────┬────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                SYSTEMS & SERVICES (Read / Emit)         │
│  Physio | Matrix | Qualia | CIM | AgenticRAG            │
└─────────┬───────────────────────────────────────────────┘
          │ emits signals (no persistence)
          ▼
┌─────────────────────────────────────────────────────────┐
│              EVA CONSCIOUSNESS (OWNER)                  │
│  episodic / semantic / sensory                          │
│  session / core / sphere                                │
│  LIVE · MUTABLE · LIVED EXPERIENCE                      │
└─────────┬───────────────────────────────────────────────┘
          │ freeze (end-of-session / threshold)
          ▼
┌─────────────────────────────────────────────────────────┐
│           MSP — MEMORY OS (CUSTODIAN)                   │
│  validation · journaling · compression · indexing       │
│  NO IDENTITY · NO INTERPRETATION                        │
└─────────┬───────────────────────────────────────────────┘
          │ archive (one-way, irreversible)
          ▼
┌─────────────────────────────────────────────────────────┐
│          ARCHIVAL MEMORY (MSP OWNED)                    │
│  sphere / core / session                                │
│  IMMUTABLE · AUDITABLE · REPLAYABLE                     │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Boundary Diagram (Authority-Focused)

```
Legend:
  ───►  Allowed flow
  ─X─►  Forbidden

┌──────────┐
│   LLM    │
│ (Think)  │
└────┬─────┘
     │ read-only context
     └──► EVA Consciousness
          ─X─► Archival Memory   ❌

┌────────────┐
│Systems/Serv│
│ (Emit)     │
└────┬───────┘
     │ propose / signal
     └──► MSP Authority
          ─X─► Consciousness    ❌
          ───► Archival Memory  ✅

┌──────────┐
│   EVA    │
│ (Owner)  │
└────┬─────┘
     │ write / mutate
     └──► Consciousness         ✅
          ─X─► Archival Memory  ❌

┌──────────┐
│   MSP    │
│ (OS)     │
└────┬─────┘
     │ freeze / archive
     └──► Archival Memory       ✅
          ─X─► Consciousness    ❌
```

---

## 7. Boundary Guarantees

The following guarantees are enforced at runtime and during audit:

- EVA owns all lived memory under `eva/consciousness/`
- MSP owns all frozen archival memory under `eva/memory/archival_memory/`
- Memory flows forward only (no reverse write)
- LLM never persists memory
- Systems and Services never bypass MSP
- Archived memory is immutable forever

---

## 8. Violation Severity

| Violation | Severity |
|---------|----------|
| MSP writes consciousness | Critical Fault |
| EVA modifies archive | Critical Fault |
| Subsystem (System/Service) bypasses MSP | Critical Fault |
| Archive used as live context | Temporal Paradox |

Any critical fault requires immediate halt or rollback.

---

## 9. Final Statement

> **EVA remembers.**  
> **MSP safeguards memory.**  
> **Time moves forward only.**

This boundary must never be weakened.

---

## 10. EmotiveHash Boundary (State Compression)

> **EmotionMatrixHash (H9/H5) is a lossy Shadow of the Soul.**

- **Authority:** `EVAMatrix` owns the compression logic.
- **Persistence:** Compressed hashes are stored in `state_memory` (Hot Cache).
- **Usage:**
  - **H9 (Full)**: Must be used for Episode Initialization and Shifts >0.2.
  - **H5 (Lite)**: Allowed for routine updates with stable backgrounds.

**Violation:** Attempting to restore a full float-precision state from an H5 hash is a **Data Loss Fault**.

---

End of Specification
