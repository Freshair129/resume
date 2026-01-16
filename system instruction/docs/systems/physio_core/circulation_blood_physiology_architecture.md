# Circulation & Blood Physiology — Architecture

## 1. Architectural Scope

This document describes the **system architecture, module boundaries, and dependencies** of the Circulation & Blood Physiology subsystem.

The goal of this architecture is to:
- Keep physiology deterministic and stable
- Separate control, interaction, and simulation concerns
- Allow long‑running background execution
- Enable future extension without refactoring the core

---

## 2. High‑Level System View

```
┌───────────────────────────┐
│        User Input         │
│  (Keyboard / Activity)    │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ TypingRhythmTracker       │
│ (Interaction Sensor)      │
└─────────────┬─────────────┘
              │ focus
              ▼
┌───────────────────────────┐
│ AdaptiveHzController      │
│ (Scheduler / Control)     │
└─────────────┬─────────────┘
              │ update_hz
              ▼
┌───────────────────────────┐
│ Background Runner         │
│ (Timing / Sleep Control)  │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ BloodEngine               │
│ (Physiology Core)         │
└─────────────┬─────────────┘
              │ hormone levels
              ▼
┌───────────────────────────┐
│ Downstream Systems        │
│ (Receptors / Reflex / UI) │
└───────────────────────────┘
```

Key idea:
> **Physiology is isolated. Control and interaction orbit around it.**

---

## 3. Module Responsibilities

### 3.1 BloodEngine

**Layer:** Physiology Core

**Responsibilities**
- Maintain blood volume
- Track hormone concentrations
- Apply hormone influx
- Apply decay and recovery (half‑life model)

**Explicitly Does NOT**
- Decide update frequency
- Read user input
- Trigger behavior or reflexes

**Dependencies**
- Circulation & Blood Physiology Configuration (blood / flow / hormone sections)

**Guarantees**
- Deterministic behavior
- Safe long‑term background execution
- Stateless interfaces (state in, state out)

---

### 3.2 AdaptiveHzController

**Layer:** Control Plane / Scheduler

**Responsibilities**
- Compute update frequency (Hz)
- Combine physiological signals with user context
- Smooth frequency changes

**Inputs**
- Stress index (external)
- Flow factor (from physiology)
- User activity state
- Focus index

**Outputs**
- Target update rate (Hz)

**Dependencies**
- Configuration scheduler section

**Non‑Responsibilities**
- Physiology simulation
- Time sleeping / threading

---

### 3.3 TypingRhythmTracker

**Layer:** Interaction Sensor

**Responsibilities**
- Observe keystroke timing
- Extract typing rhythm features
- Produce focus index (0–1)

**Important Rule**
> Interaction signals never modify physiology directly.

**Dependencies**
- Interaction section of configuration

---

### 3.4 Background Runner (Glue Layer)

**Layer:** Runtime Orchestration

**Responsibilities**
- Call AdaptiveHzController
- Sleep according to computed Hz
- Call BloodEngine.update()

**Design Note**
This layer is intentionally thin and replaceable.
It may run in:
- Main thread
- Background thread
- Async task
- External scheduler

---

## 4. Dependency Graph

```
Configuration.yaml
   ├── blood / flow / hormone_transport ──► BloodEngine
   ├── scheduler ────────────────────────► AdaptiveHzController
   └── interaction ──────────────────────► TypingRhythmTracker

TypingRhythmTracker ──► focus ──┐
                                 ├──► AdaptiveHzController ──► Hz
External Stress / Flow ─────────┘

AdaptiveHzController ──► Background Runner ──► BloodEngine

BloodEngine ──► hormone levels ──► downstream systems
```

There are **no circular dependencies**.

---

## 5. Data Flow Sequence (Typical Loop)

```
User types
   ↓
TypingRhythmTracker updates focus
   ↓
AdaptiveHzController computes Hz
   ↓
Runner sleeps (1 / Hz)
   ↓
BloodEngine.update()
   ↓
Hormone decay / clearance
   ↓
State available for readers
```

This loop may pause, slow down, or speed up without breaking consistency.

---

## 6. Separation of Concerns (Why This Matters)

| Concern        | Module               |
|---------------|----------------------|
| Physiology    | BloodEngine          |
| Scheduling    | AdaptiveHzController |
| Interaction   | TypingRhythmTracker  |
| Orchestration | Background Runner    |

This separation allows:
- Independent testing
- Offline simulation
- Replay / fast‑forward
- Safe future extensions

---

## 7. Extension Zones (Safe to Add)

Future modules may connect at these points:

- **After BloodEngine**: Receptors, dashboards, reflex engines
- **Before Scheduler**: Additional sensors (mouse, gaze, heart rate)
- **Inside Scheduler**: New weighting strategies

**Hard Rule**
> No extension may mutate BloodEngine internals directly.

---

## 8. Architectural Invariants

The following must always remain true:
- BloodEngine is unaware of users
- Interaction never alters physiology
- Scheduler never alters hormone values
- Time progression is monotonic
- All loops are bounded

Breaking these invariants risks system instability.

---

## 9. Mental Model Summary

Think of the architecture as **nested rings**:

```
[ Interaction ]
     ↓
[ Scheduler ]
     ↓
[ Physiology ]
```

Each inner ring must remain stable regardless of what the outer rings do.

---

## 10. Closing Notes

This architecture is intentionally conservative.

Stability at the physiology layer enables complexity everywhere else —
without risking cascading failure or runaway behavior.

