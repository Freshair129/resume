# EVA 9.1.0 – Event Policy Specification

> **Status**: Canonical / Enforced
>
> This document defines how *events* are treated inside EVA 9.1.0.
> It is normative and overrides any generic “event-driven” interpretation.

---

## 1. Core Position

**EVA is NOT an event-driven system.**

EVA is a **state-dominant organism** in which:

- Events never trigger behavior
- Events never own control flow
- Events never bypass physiology

> Events are transient perturbations, not drivers.
> **Note**: This policy applies to *Control Events*. *Resonance Signals* (State Snapshots on the Bus) are not events; they are the continuous flow of the organism's existence.

---

## 2. Definition of Event

### Stimulus (Technical Form of Event)

An **Event** manifested as a **Stimulus Vector** is a *structured perturbation* originating from internal or external sources that:

- has no persistence
- has no authority
- carries no decision power
- **Normalization**: All events must be converted into a normalized `StimulusVector` before affecting `PhysioCore`.

Examples:

- user input (as a stream of chunks)
- system signal
- environment change
- internal alert

Non-properties:

- Events are NOT commands
- Events are NOT triggers
- Events are NOT instructions

---

## 3. Event Ownership Rules

### Ownership

- Events are owned by **no system**
- Events are never state owners
- Events may not mutate state directly

### Authority

- Events have **zero authority**
- All authority resides in System-level state

---

## 4. Canonical Flow (V9.1.0)

```text
Event (Signal / Ligand)
 ↓
Metric Calculation (RI/RIM)
 ↓
──────────────
   THE GAP
  (Physio Core ‖ Quick RAG)
  (Deep RAG Post-State)
──────────────
 ↓
Phase 2: Reasoning (Post-Inference)
 ↓
Response (Expression)
```

Key constraints:

- Events never enter The Gap
- Events are normalized before any state interaction
- PhysioCore state always updates before reasoning
- **Transcription Dominance**: Logic (Nodes/Modules) only executes by reading the state post-transcription.

---

## 5. PhysioCore Event Policy

### Hard Rules

- PhysioCore does NOT subscribe to events
- PhysioCore is NOT invoked by events
- PhysioCore does NOT expose event handlers

### Behavior

- PhysioCore operates in a continuous loop
- PhysioCore state shifts as a consequence of environmental change
- Event effects are mediated indirectly through normalized perception

> Physiology changes first. Cognition follows.

---

## 6. Orchestrator Event Policy

Orchestrator responsibilities:

- **Event Awakening**: The Orchestrator is the *only* component awakened by external events.
- receive events
- normalize and chunk stimuli into `StimulusVectors`
- route signals to the Resonance Bus
- enforce boundaries

Orchestrator limitations:

- must not decide behavior
- must not mutate PhysioCore directly (must use Bus/Stimulus Injection)
- must not forward raw events to Nodes

---

## 7. Module & Node Event Policy

### Modules

- never subscribe to events
- operate only when orchestrated
- consume state snapshots, not events

### Nodes (e.g. PRN)

- do not react to events
- do not handle callbacks
- do not own timing

Nodes may execute **only after** state mediation.

---

## 8. Forbidden Event Patterns (Violation)

The following patterns are **explicitly forbidden**:

- event → action
- event handler → decision
- event-driven callback logic
- event bypassing PhysioCore
- event-based thresholds triggering behavior

Any occurrence is a **policy violation**.

---

## 9. Allowed Event Usage

Events MAY be used to:

- perturb perception
- influence state indirectly
- contribute to long-term bias

Events MAY NOT be used to:

- trigger execution
- select persona
- invoke services directly

---

## 10. Agent Implementation Directive

> Implement no event handlers.
> Treat events as noise applied to perception.
> All behavior must emerge from System state.

---

## 11. Summary Statement (Authoritative)

> **EVA is state-driven.
> Events do not cause behavior.
> Events only disturb the organism; the organism decides how to respond.**

This policy is mandatory for all EVA 9.1.0 components.

---

## 12. Persistent State Policy (Context & Matrix)

With the introduction of **Granular Context Storage** (`eva/memory/context_storage/`) and **EmotiveHash** (`eva_matrix_state.json`), the following policies apply:

### 12.1 Context is Not an Event

- Restoring a context ID from storage is **State Resurrection**, not an event.
- It re-establishes the *Latching Loop* at a specific `turn_index` and `time`.
- Loading `eva_matrix_state.json` (Hot Cache) is an O(1) memory operation, equivalent to waking up.

### 12.2 Hashing is Not Summarization

- **EmotiveHash (H9/H5)** is a *compression of feeling*, not a summary of text.
- It must be treated as a **Biological Signal** (State), never as linguistic content.
- Restoring state from H9 MUST respect the `scale_factor` (1000x) to prevent "Emotional Hallucination" (e.g., interpreting `0.9` as `900`).
