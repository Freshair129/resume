# Resonance Index Concept & Integration Guide

## Overview

The **Resonance Index (RI)** is EVA's cognitive resonance calculator. It measures how well the current experience aligns with stored memories, values, and emotional patterns.

## Core Concept

### What is Resonance?
RI quantifies the "cognitive harmony" between:
1. **Current State** (EVA Matrix output)
2. **Historical Patterns** (RMS clusters)
3. **Emotional Baseline** (Physio state)

**Output**: Single score (0.0 - 1.0)
- `0.0` = Complete dissonance (unfamiliar/uncomfortable)
- `1.0` = Perfect resonance (deeply familiar/comfortable)

## Calculation Components

### 1. Cognitive Alignment
- Compares current cognitive vectors with historical clusters
- Uses vector similarity (cosine distance)

### 2. Emotional Congruence
- Matches current emotional state with memory-tagged emotions
- Weighted by emotional intensity

### 3. Memory Similarity
- Measures overlap with existing episodic memories
- Recent memories weighted higher

### Formula (Simplified)
```
RI = (0.4 × cognitive_alignment) + (0.3 × emotional_congruence) + (0.3 × memory_similarity)
```

## Bus Integration

### Subscribe
- `bus:psychological` (EVA Matrix state)
- `bus:knowledge` (RMS clusters)

### Publish
- `bus:knowledge` (RI output)

### Consumers
1. **RMS** - Uses RI for memory encoding depth
2. **RIM** - Converts RI to physiological multipliers
3. **CIN** - Adjusts context based on RI
4. **Orchestrator** - Logs RI for analytics

## Use Cases

### 1. Memory Encoding (RMS)
```
High RI (>0.8) → Deep encoding (L3/L4)
Low RI (<0.3) → Light encoding (L1/L2)
```

### 2. Prompt Adjustment (CIN)
```
Low RI → Add more context (user experiencing something new)
High RI → Minimal context (familiar territory)
```

### 3. Emotional Amplification (RIM → Physio)
```
High RI + Positive emotion → Amplified joy
High RI + Negative emotion → Amplified distress
```

## API

### `calculate_resonance_index(psyche_state, memory_clusters)`
Returns: `{ resonance_index: 0.75, components: {...} }`

## Configuration

See `configs/ri_config.yaml` for:
- Component weights
- Similarity thresholds
- Calculation parameters

---

**Related Modules**:
- [RIM](../../resonance_impact/docs/RIM_CONCEPT.md) - Impact calculator
- [RMS](../../resonance_memory_system/docs/RMS_CONCEPT.md) - Memory encoder
