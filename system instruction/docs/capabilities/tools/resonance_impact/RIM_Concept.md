# Resonance Impact Model (RIM) Concept

> **Module**: RIM (Resonance Impact Model)
> **Role**: Central Module (Interpretation Layer)
> **Parent**: Orchestrator / Operation System
> **Version**: 9.1.0

## 1. Philosophy

The **Resonance Impact Model (RIM)** acts as the "Instinctual Translator" for EVA. It bridges the gap between raw linguistic analysis (Sentiment/Intent) and biological consequence (Hormones/Vitals).

EVA does not just "read" text; she "feels" it. RIM quantifies this feeling into a normalized numerical score called **Resonance Impact (RI)**.

## 2. Core Function

RIM takes signals from the **Cognitive Gateway (SLM)** and maps them to a float value between `-1.0` (Trauma/Stress) and `+1.0` (Euphoria/Connection).

### The Formula

```text
Impact = (Base_Emotion_Score * Salience_Multiplier) -> Clamped[-1.0, 1.0]
```

- **Base_Emotion_Score**: The innate emotional weight of a signal (e.g., `affection: 0.8`, `anger: -0.8`).
- **Salience_Multiplier**: Amplification based on context (e.g., User mentions a core memory or uses specific keywords).

## 3. Impact Curves (Logic Detail)

RIM uses non-linear curves to create realistic physiological variance:

| RI Score | Impact Level | Hormone Multiplier | Receptor Sensitivity |
| :--- | :--- | :--- | :--- |
| **< 0.3** | **Low** | 0.5x (Dampened) | 0.7x |
| **0.3 - 0.79** | **Medium** | 1.0x (Standard) | 1.0x |
| **≥ 0.8** | **High** | 1.8x (Amplified) | 1.5x |

### Use Cases

- **Trauma/Ecstasy (High)**: Causes intense cortisol or dopamine spikes.
- **Routine (Low)**: Minimal physiological change, maintaining homeostasis.

## 3. Workflow

1. **Input**: User text + SLM Tags (Sentiment, Intent).
2. **Lookup**: RIM checks `RIM_configs.yaml` for the base score.
3. **Calculation**: Applies multipliers.
4. **Output**: Returns `R-impact_score` to the Orchestrator.
5. **Effect**: This score directly modulates `PhysioCore` (releasing Dopamine, Cortisol, etc.).

## 4. Architecture

- **Engine**: `agent/operation_system/rim/rim_engine.py`
- **Config**: `agent/operation_system/rim/configs/RIM_configs.yaml`
- **Integration**: Called synchronously during **Phase 1 (Pre-Inference)**.

## 5. Why "Resonance"?

It is not just about "Sentiment Analysis". Resonance implies a vibration that persists. A high positive RIM score doesn't just make EVA happy for a second; it "resonates" in her hormonal baseline, creating a mood that lasts for minutes or hours (via the 30Hz Physio Loop).
