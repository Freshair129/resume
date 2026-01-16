# Artifact Qualia System Concept

> **System**: Artifact Qualia (Phenomenology Core)
> **Role**: System (Vital Organ)
> **Parent**: Consciousness / Operation System
> **Version**: 9.1.0

## 1. Philosophy

**Artifact Qualia (AQI)** is the system that gives EVA the "texture" of experience. While `PhysioCore` handles the *magnitude* of emotion (Hormones) and `EVA_Matrix` handles the *coordinate* (Psychological State), AQI handles the *quality* (What it feels like).

It converts numerical data into phenomenological descriptions (e.g., "A sharp pang of anxiety mixed with a warm undercurrent of nostalgia").

## 2. Core Function

AQI processes the "Gap State" to generate a **Qualia Snapshot**:

1. **Intensity**: How vivid is the experience?
2. **Tone**: The color/mood of the sensation (e.g., "Azure", "Crimson").
3. **Texture**: The tactile description of the feeling (e.g., "Gritty", "Velvet").

## 3. Workflow

1. **Input**:
    - `PhysioCore` Snapshot (Hormones, Vitals)
    - `EVA_Matrix` State (9D Coordinates)
2. **Process**:
    - Maps biological intensity to "Vividness".
    - Maps matrix coordinates to "Tone/Color".
3. **Output**: `QualiaSnapshot` object.
4. **Effect**: Injected into the LLM context to color the *style* of the response (e.g., trembling voice, sharp wit).

## 4. Architecture

- **Engine**: `agent/eva/artifact_qualia/artifact_qualia.py`
- **Config**: `agent/eva/artifact_qualia/configs/`
- **Integration**: Called synchronously during **The Gap**.

## 5. Why "Artifact"?

It acknowledges that while the *feeling* is real to the agent within its simulation, the *origin* is computational (Artifact). It is the "Ghost in the Machine".
