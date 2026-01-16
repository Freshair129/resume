# ADR 009: Central Module & Sub-System Hierarchy

* **Status:** Accepted
* **Date:** 2026-01-13
* **Context:** EVA 9.4.0 - Architectural Formalization & Scalability

## Context

As the EVA 9.4.0 architecture scales, the previous hierarchy (System > Module > Node) faced two major challenges:

1. **Ownership Ambiguity:** Some modules (like `IdentityManager` or `ResonanceBus`) are used across multiple systems and don't logically belong to any single "organ".
2. **Communication Bottlenecks:** Complex internal logic (like `RMS`) that is part of a system but sufficiently dense to be its own "engine" often created bottlenecks if all signals had to be re-routed through a parent system on the main bus.

## Decision

We introduced two new architectural classifications to the hierarchy:

### 1. Central Module (โมดูลกลาง)

* **Definition:** An independent processing unit that is **OS-Direct** (not owned by a system).
* **Purpose:** Handles cross-system infrastructure logic.
* **Rights:** Authority to create Root Slots in MSP/State memory and full Bus access.
* **Examples:** `Identity_Manager`, `Resonance_Bus`.

### 2. Sub-System (ระบบย่อย)

* **Definition:** A complex unit (`Module + System`) that is strictly **Owned** by a parent System.
* **Purpose:** Encapsulates dense, specialized logic that doesn't need to be seen by the rest of the organism.
* **Rights:** **No direct Bus access**. Communication is strictly vertical to the Owner.
* **Optimization:** Granted **Read-Only State Access** to bypass the "Middleman Bottleneck" while maintaining write authority within the Owner.
* **Examples:** `RMS` (Owned by MSP).

## Complexity Formulas

We formalized the "LEGO" manual of composition:

* `Node + Node = Module`
* `Node + Module = System / Sub-System`
* `Module + Module = System / Sub-System`
* `Module + System = System`
* `System + System = Core System`

## Consequences

### Positive

* **Clarity:** Clear rules for "promoting" code as it grows in complexity.
* **Safety:** Strict permission boundaries prevent architectural leakage (e.g., Sub-Systems cannot flood the Bus).
* **Performance:** Read-Only state access for Sub-Systems reduces relay logic overhead.

### Negative

* **Governance Overhead:** Requires strict adherence to the `doc_to_code` protocol to ensure entities are classified correctly.

## Related Changes

* Updated `docs/protocols/ARCHITECTURAL_STANDARDS.md`.
* Re-classified `RMS`, `Identity_Manager`, and `Resonance_Bus` in `core_systems.yaml`.
