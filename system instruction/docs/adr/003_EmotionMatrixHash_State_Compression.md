# ADR 003: EmotionMatrixHash State Compression

## Status

Accepted

## Context

As the EVA system processes more complex emotional and biological states, the Phase 1 Prompt has grown significantly in token size. The `9D_MATRIX_BASELINE` section, which describes the previous emotional state, takes up considerable space espcially when tracking historical trends. We need a way to persist this historical data efficiently without sacrificing the granularity of the 9-dimensional emotional model.

## Decision

We will implement a dual-format state compression mechanism called **EmotionMatrixHash**.

1. **Format H9 (Full Resolution)**: Used when significant emotional shifts occur. Encodes all 9 dimensions.
    - Format: `H9-{RI}-S{stress}W{warmth}D{drive}C{clarity}J{joy}A{alertness}CO{connection}GN{groundedness}OP{openness}`
    - Example: `H9-450-S750W450D600C550J300A820CO400GN500OP650`

2. **Format H5 (Compressed)**: Used when the background dimensions (Alertness, Connection, Groundedness, Openness) are stable (Delta < 0.05). Encodes only the 5 core dynamic dimensions (Stress, Warmth, Drive, Clarity, Joy).
    - Format: `H5-{RI}-S{stress}W{warmth}D{drive}C{clarity}J{joy}`
    - Example: `H5-420-S500W1D750C850J500`

3. **Encoding Rules**:
    - Scale Factor: 1000 (e.g., 0.45 -> 450)
    - Max Value (1.0): Encoded as single char "1" to save space.
    - Flooring: Values are floored to nearest integer.

## Consequences

- **Positive**: Reduces token usage for historical emotional tracking by ~80% compared to full YAML format.
- **Positive**: Maintains full 9D fidelity when needed (H9) while optimizing for the common case of stable background traits (H5).
- **Negative**: Requires LLM to "decode" the hash string, adding a small amount of reasoning overhead (acceptable trade-off).

## Compliance

- Adheres to `SYSTEM_DOCUMENTATION_STANDARD.md` for configuration and naming.
- Configured via `eva_matrix/configs/state_compression.yaml`.
