# Circulation & Blood Physiology — Overview

## 1. Purpose

Circulation & Blood Physiology is the **foundational physiology engine** of EVA.
Its role is to simulate **blood circulation and hormone transport** in a way that is:

- Physiologically realistic (not toy-level)
- Computationally lightweight
- Safe to run continuously in the background (BG / streaming)
- Modular and extensible for future systems (receptors, reflexes, feedback loops)

This system intentionally **does not simulate detailed fluid mechanics**.
Instead, it models **functional physiology** — how blood *behaves* as a carrier of signals.

---

## 2. Design Philosophy

### 2.1 Physiology over Physics
The system prioritizes **biological outcomes** over exact physical accuracy.

We do **not** simulate:
- Navier–Stokes equations
- Vessel geometry
- Turbulence or shear stress

We **do** simulate:
- Blood volume and pressure behavior
- Flow rate as a scalar signal
- Hormone mixing, clearance, and half-life dynamics

This mirrors how **medical physiology models** are built in practice.

---

### 2.2 Lumped Parameter Model
The vascular system is represented as **aggregated compartments**:

- Arterial
- Capillary
- Venous

Each compartment contributes to:
- Pressure behavior
- Resistance
- Compliance

No explicit vessel topology is tracked.

---

### 2.3 Streaming, Not Tick-Based
The system runs as a **continuous background process**.

- No fixed global tick loop
- No frame-by-frame simulation
- All dynamics are evaluated lazily on update or read

Time is handled as:
```
Δt = now - last_update
```

This allows the engine to run indefinitely without drift or CPU spikes.

---

## 3. Core Components

### 3.1 BloodEngine (Physiology Core)

**Responsibilities**
- Maintain blood volume
- Track hormone concentration in plasma
- Apply hormone influx (from organs)
- Apply decay and recovery (half-life model)

**Non-responsibilities**
- Scheduling (Hz control)
- User interaction
- Receptor binding logic
- Reflex or behavioral effects

BloodEngine is designed to be:
- Deterministic
- Testable in isolation
- Reusable for offline simulation or replay

---

### 3.2 Flow Model

Flow rate is modeled as a **single scalar value (mL/sec)**.

It is derived from:
- Cardiac output
- Effective resistance
- Blood viscosity modifiers

Flow affects:
- Hormone mixing speed
- Clearance efficiency
- Adaptive scheduling input

Flow does **not** represent spatial movement through vessels.

---

### 3.3 Hormone Transport & Clearance

Hormones are modeled as **concentrations in plasma**:
```
concentration = mass / distribution_volume
```

Clearance uses a **half-life exponential decay model**:
```
C(t) = baseline + (C0 - baseline) * exp(-k * Δt)
```

Key behaviors:
- Excess hormone decays quickly
- Below-baseline recovery is slower
- Clearance can be coupled to flow rate

---

### 3.4 Plasma Protein Binding (Optional Layer)

Hormones may exist as:
- Free (bioavailable)
- Protein-bound (inactive)

Binding is modeled using:
- Equilibrium (Kd-based) approximation
- No molecular dynamics

This layer exists to support future receptor realism.

---

## 4. Adaptive Update Rate (Scheduler)

The system does **not** run at a fixed frequency.

Update rate (Hz) is computed dynamically based on:
- Physiological stress
- Blood flow rate
- User activity (active / idle / inactive)
- Cognitive focus (derived from typing rhythm)

This creates a system that:
- Updates more frequently when dynamics are fast
- Conserves resources when the system is calm

Smoothing (EMA) prevents abrupt frequency jumps.

---

## 5. Interaction Signals

User interaction is treated as **context**, not physiology.

Typing rhythm is analyzed to extract:
- Typing speed
- Burst continuity
- Pause behavior

These signals are combined into a **Focus Index (0–1)**.

Important rule:
> Interaction signals **never directly change hormone values**  
> They only influence scheduling precision.

---

## 6. Safety and Stability

The system enforces multiple guards:
- Concentration floors and caps
- Exponential overflow protection
- Bounded time deltas
- Deterministic execution

These guarantees ensure:
- No runaway values
- No NaN propagation
- Long-term BG stability

---

## 7. What This System Is Not

This system is **not**:
- A cardiovascular CFD simulator
- A medical diagnostic tool
- A neural or emotional engine
- A receptor or reflex model

Those systems are designed to be **layered on top**, not mixed in.

---

## 8. Extension Strategy

Future systems may attach via well-defined boundaries:
- Receptor dynamics (read-only hormone access)
- Reflex engine (behavioral side effects)
- Feedback loops (HPA / HPT / HPG axes)
- Sleep and circadian models

The core guarantee:
> Extensions must not require changes to blood circulation or hormone transport logic.

---

## 9. Mental Model Summary

Think of this system as:
```
Organs → Hormone Mass
Hormone Mass → Blood
Blood → Concentration
Concentration → Decay over Time
Flow → Speed & Clearance
Scheduler → Precision Control
```

It is the **biological substrate** upon which higher cognition and behavior can be built.

---

## 10. Closing Note

Circulation & Blood Physiology is intentionally boring.

That is its strength.

A stable, quiet physiology core allows everything above it to become expressive,
adaptive, and intelligent — without the risk of systemic collapse.

