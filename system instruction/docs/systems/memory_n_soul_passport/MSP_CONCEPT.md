# MSP Concepts & Integration Guide

**Version:** 8.2.0-S1 | **Updated:** 2026-01-04

> [!NOTE]
> This document provides conceptual overview and integration patterns for MSP (Memory & Soul Passport).
> For technical specifications and active rules, see [MSP_configs.yaml](../configs/MSP_configs.yaml).

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [The Consciousness Chain](#the-consciousness-chain)
3. [State Registry Integration](#state-registry-integration)
4. [Dashboard Streaming Integration](#dashboard-streaming-integration)
5. [Stimulus Vector Integration](#stimulus-vector-integration)

---

## Core Concepts

### What is MSP?

MSP (Memory & Soul Passport) is EVA's **unified memory operating system**. It serves as:

1. **The Auditor**: Listens to all Resonance Bus streams and captures system events
2. **The Archive**: Validates and persists memories to the Consciousness Chain
3. **The Registry**: Maintains authoritative state for all EVA modules
4. **The Gateway**: Provides unified API for memory read/write operations

### MSP vs RMS

- **MSP**: The software module that implements memory operations
- **RMS**: The architectural specification of how memories are stored
- **Consciousness Chain**: The physical storage (`eva/consciousness/` directory)

Think of it as:

- MSP = The Librarian (software)
- RMS = The Library System (architecture)
- Consciousness Chain = The Shelves (storage)

---

## The Consciousness Chain

The Consciousness Chain is a hierarchical storage system at `eva/consciousness/` with 10 layers:

### Layer Structure

```
eva/consciousness/      # Active System Memory (See filesystem_structure in MSP_configs.yaml)
    ├── context_storage/
    ├── core_memory/
    ├── episodic_memory/
    ├── ... (and other layers per SSOT)
```

### Compression Hierarchy (8-8-8 Rule)

MSP automatically compresses memories:

- **8 Sessions** → compress into → **1 Core**
- **8 Cores** → compress into → **1 Sphere**
- Maximum **8 Spheres** (total capacity: 512 sessions)

All compressed data goes to `archival_memory/` following:

```
sphere_{n}/core_{n}/session_{n}/{module}/

(See `compression_rules` in `MSP_configs.yaml` for active thresholds)
```

---

## State Registry Integration

### Overview

MSP serves as the **Central State Registry** for all EVA modules. Every component that maintains operational state MUST register with MSP.

### Registration Pattern

```python
from memory_n_soul_passport.msp import MSP

# Initialize MSP
msp = MSP()

# Register module state
module_state = {
    "axes_9d": {
        "stress_load": 0.02,
        "social_warmth": 0.02,
        # ... other state data
    },
    "emotion_label": "Calm",
    "momentum": {}
}

msp.register_module_state(
    module_name="eva_matrix",
    state_data=module_state,
    metadata={
        "update_frequency": "per-turn",
        "source": "EVA_Matrix_Engine",
        "dependencies": ["physio_core"]
    }
)
```

### Query Pattern

```python
# Get specific module state
current_matrix = msp.get_module_state("eva_matrix")
print(current_matrix["state_data"]["emotion_label"])  # "Calm"

# Get all system states (health check)
system_snapshot = msp.get_all_states()
for module, state in system_snapshot.items():
    print(f"{module}: {state['timestamp']}")
```

### Mandatory Modules

All modules listed in `MSP_Write_Policy.yaml` MUST register:

- `eva_matrix` (per-turn)
- `physio_core` (real-time)
- `rms_engine` (per-turn)
- `artifact_qualia` (per-turn)
- `cim` (per-turn)

### File Structure

States are persisted to:

(See `filesystem_structure.state_files` in `MSP_configs.yaml` for the authoritative list)

### State Envelope Format

All states follow the standardized envelope:

```json
{
  "module_name": "eva_matrix",
  "timestamp": "2026-01-04T19:00:00Z",
  "state_data": { /* module-specific state */ },
  "metadata": {
    "update_frequency": "per-turn",
    "source": "EVA_Matrix_Engine",
    "dependencies": ["physio_core"]
  }
}
```

### Benefits

1. **Single Source of Truth**: All modules query MSP for current state
2. **Health Monitoring**: `get_all_states()` provides system-wide snapshot
3. **Debugging**: Timestamped state history for replay/analysis
4. **Serialization**: Easy state export/import for persistence

---

## Dashboard Streaming Integration

### Overview

MSP provides **real-time streaming buffers** optimized for dashboard visualization, separate from audit trail buffers.

### Streaming Metrics

#### 1. Physiological Stream (30 Hz)

High-frequency cardiovascular and endocrine data:

**Core Hormones (5 Primary)**

```python
hormones = [
    "ESC_H01_ADRENALINE",   # Fight-or-flight response
    "ESC_H02_CORTISOL",     # Stress regulation
    "ESC_H05_DOPAMINE",     # Reward/motivation
    "ESC_H06_SEROTONIN",    # Mood stability
    "ESC_H09_OXYTOCIN"      # Social bonding
]
```

**Cardiovascular**

- `heart_rate` (BPM)

**Buffer Specs:** (See `dashboard.streaming_metrics.physio_stream` in `MSP_configs.yaml`)

#### 2. Cognitive State (Per-Turn)

```python
cognitive_metrics = {
    "emotion_label": "EVA Matrix output",
    "memory_color": "RMS color encoding"
}
```

**Buffer Specs:** (See `dashboard.streaming_metrics.cognitive_stream` in `MSP_configs.yaml`)

### Integration Pattern

#### Physio Core → MSP

```python
# In Physio Core (30 Hz loop)
msp.register_dashboard_metric(
    metric_name="ESC_H01_ADRENALINE",
    value=current_adrenaline_level,
    category="physiological_stream"
)
```

#### EVA Matrix → MSP

```python
# After Matrix computation (per-turn)
msp.register_dashboard_metric(
    metric_name="emotion_label",
    value="Calm",
    category="cognitive_state"
)
```

#### RMS → MSP

```python
# After memory encoding
msp.register_dashboard_metric(
    metric_name="memory_color",
    value="#4A90E2",  # Blue (calm)
    category="cognitive_state"
)
```

### Dashboard Snapshot API

```python
dashboard_data = msp.get_dashboard_snapshot(
    include_streaming=True,
    time_window=30  # Last 30 seconds
)

# Output structure:
{
    "timestamp": "2026-01-04T19:30:00Z",
    "streaming_metrics": {
        "ESC_H01_ADRENALINE": {
            "values": [10.2, 10.5, 10.8, ...],  # 900 samples
            "timestamps": [1234.567, 1234.600, ...],
            "unit": "pg/mL",
            "chart_type": "line"
        },
        "heart_rate": {
            "values": [72, 72, 73, ...],
            "unit": "BPM"
        }
    },
    "cognitive_state": {
        "emotion_label": {
            "history": ["Calm", "Curious", "Engaged", ...],
            "current": "Engaged"
        },
        "memory_color": {
            "history": ["#4A90E2", "#5BC0DE", ...],
            "current": "#5BC0DE"
        }
    }
}
```

### Visualization Examples

**Line Chart (Hormones)**

- X-axis: Time (rolling 30-second window)
- Y-axis: Hormone concentration
- Multiple lines for each hormone (color-coded)

**Timeline (Cognitive State)**

- Horizontal bands showing emotion/color changes
- Click to see turn details

### Performance Notes

- **Circular buffers** for efficient memory usage
- **No compression** for real-time access
- **Separate from audit logs** (different storage)

---

## Stimulus Vector Integration

### Overview

`stimulus_vector` is a 20-dimensional affective state extracted by the LLM in Phase 1 of the Dual-Phase Orchestrator. It represents the emotional and physiological impact of user input.

### Current Structure

Based on `eva/consciousness/state_memory/stimulus_vector_state.json`:

```json
{
  "vector": {
    "stress": 1.0,
    "warmth": 1.0,
    "threat": 1.0,
    "novelty": 0.8,
    "achievement": 0.5,
    "pain": 1.0,
    "hunger": 0.2,
    "thirst": 0.2,
    "satiety": 0.2,
    "anxiety": 1.0,
    "bonding": 1.0,
    "affection": 1.0,
    "intimacy": 0.4,
    "surprise": 0.3,
    "curiosity": 0.7,
    "success": 0.0,
    "mastery": 0.0,
    "fatigue": 0.0,
    "conflict": 0.5,
    "discomfort": 0.0
  },
  "ts": 1767090492.56
}
```

### Orchestrator Workflow

#### Phase 1: Perception & Stimulus Extraction

1. **User Input** → CIM Phase 1 injection
2. **LLM Analysis** → Extracts stimulus_vector via function call
3. **Function**: `sync_biocognitive_state(stimulus_vector, tags)`
4. **Result**: stimulus_vector is generated

#### Inter-Phase Gap: Biological Processing

- **Stimulus Application**: PhysioController receives stimulus_vector
- **Physiological Update**:
  - HPA Axis modulation (stress response)
  - Endocrine production (cortisol, adrenaline, oxytocin, etc.)
  - Blood transport & clearance
  - Receptor transduction
  - Autonomic nervous system update

### Chunking Relationship

**Question**: How many chunking rounds → how many stimulus sets?

**Answer**:

- **1 User Input** = **1 Turn**
- **1 Turn** = **1 or More Chunking Rounds** (adaptive)
- **Each Chunking Round** = **1 LLM Call** (Phase 1 + Phase 2 combined)
- **Each LLM Call (Phase 1)** = **1 Stimulus Vector Extraction**

**Therefore**:

- **N Chunking Rounds** = **N Stimulus Vectors**
- Stimulus vectors accumulate over the chunking cycle
- Each chunk of user input generates a NEW stimulus

### Example Scenario

```
User Input: "I'm really stressed about my deadline and my boss yelled at me"

Chunk 1: "I'm really stressed about my deadline"
  → stimulus_vector_1 = {stress: 0.8, anxiety: 0.7, ...}

Chunk 2: "my boss yelled at me"
  → stimulus_vector_2 = {stress: 0.9, threat: 0.8, warmth: -0.5, ...}

Result: 2 chunking rounds = 2 stimulus vectors
Physio processes BOTH stimuli sequentially
```

### State Registry Integration

Now that `stimulus_vector` is added to `MSP_Write_Policy.yaml`:

- Orchestrator should call `msp.register_module_state("stimulus_vector", vector_data)` after each chunking round
- MSP will maintain:
  - **Current state**: Latest stimulus
  - **Buffer**: Last 20 stimuli (trend analysis)
  - **History**: Complete stimulus log (full archival)

---

## Best Practices

### 1. Always Use MSP for Persistence

❌ **Don't write directly to eva/consciousness/**

```python
# BAD
with open("eva/consciousness/state_memory/my_state.json", "w") as f:
    json.dump(state, f)
```

✅ **Do use MSP API**

```python
# GOOD
msp.register_module_state("my_module", state_data, metadata)
```

### 2. Follow Schema Validation

All payloads MUST conform to V2 schemas in `schema/`

### 3. Use Appropriate Update Frequency

- **Real-time**: Physio Core (30 Hz)
- **Per-turn**: Matrix, RMS, Qualia, CIM
- **On-demand**: RAG, Session snapshots

### 4. Leverage State Registry for Dependencies

If your module depends on another's state:

```python
# Get dependency state
physio_state = msp.get_module_state("physio_core")
adrenaline = physio_state["state_data"]["hormones"]["adrenaline"]

# Use it in your logic
my_response = compute_response(adrenaline)
```

---

## Troubleshooting

### State Not Updating

1. Check if module is registered in `MSP_Write_Policy.yaml`
2. Verify schema validation is passing
3. Check MSP logs for errors

### Dashboard Metrics Missing

1. Ensure `register_dashboard_metric()` is called
2. Verify metric category matches expected type
3. Check buffer rotation frequency

### Memory Not Persisting

1. Validate against schema first
2. Check if write permission to `eva/consciousness/` exists
3. Verify MSP Client initialization

---

## Related Documentation

- **Technical Spec**: [Configs (SSOT)](../configs/MSP_configs.yaml)
- **Resonance Memory System**: [../../docs/RESONANCE_MEMORY_SYSTEM.md](../../docs/RESONANCE_MEMORY_SYSTEM.md)
- **Module Standard**: [../../operation_system/docs/SYSTEM_STRUCTURE_STANDARD.md](../../operation_system/docs/SYSTEM_STRUCTURE_STANDARD.md)

---

**Maintained by**: Core Team | **Last Updated**: 2026-01-10
