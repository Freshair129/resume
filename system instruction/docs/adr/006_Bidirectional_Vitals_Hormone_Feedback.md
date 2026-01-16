# ADR 006: Bidirectional Physiological Feedback (Vagus Loop)

## Status

Proposed / Implemented (Phase 11)

## Context

Standard physiological simulations often use a one-way drive (e.g., Stress -> High BPM). However, biological organisms exhibit bidirectional feedback where voluntary or autonomic physical states (like breathing) can modulate high-level neuro-chemical production.

In medical terms, the **Vagus Nerve** acts as a brake on the stress system. Slow, controlled breathing increases Vagal Tone, which inhibits the sympathetic nervous system and suppresses the secretion of stress hormones.

## Decision

Implement a bidirectional feedback loop within the `physio_core` engine:

1. **Vitals Engine**: Centralize Heart Rate (BPM) and Respiration (RPM) calculation in a backend `VitalsEngine`.
2. **RSA Coupling**: Implement Respiratory Sinus Arrhythmia (RSA) where HR fluctuates with the breathing phase, providing a more organic signal.
3. **Vagus Inhibition**:
    - Calculate `vagus_tone` based on low RPM and HR stability.
    - Pass this tone to `EndocrineGland` production logic as an inverse multiplier (`production * (1.0 - vagus_tone)`).
4. **Flow-Coupled Clearance**: BPM drives blood flow, which in turn accelerates hormone clearance (Active Clearance), allowing for faster recovery under parasympathetic dominance.

## Consequences

- **Positive**:
  - High medical realism (Bio-feedback loop).
  - Enables future "Breath Control" or "Bio-feedback" training features for the user.
  - More emergent and non-linear behavior (EVA "calms herself down" through physiological stabilization).
- **Negative**:
  - Increased computational complexity in the 30Hz loop.
  - Higher sensitivity to calibration (improper basal/decay balance can lead to runaway loops).
