# Trajectory System Concept (v9.4.0)
>
> **System ID:** `SYSTEM_TRAJECTORY` | **Domain:** `operation_system` | **Status:** Operational

## 1. Overview

The **Trajectory System** captures the agent's execution trace, providing transparency into the decision-making process beyond outcome-only Episodic Memory.

## 2. Purpose

### What Episodic Memory Captures

- **Result**: User said X, EVA said Y
- **Outcome**: Final emotional state, RI score

### What Trajectory Captures

- **Process**: How EVA *arrived* at the answer
- **Reasoning**: Chain of Thought (CoT)
- **Tool Usage**: Which tools were called, with what args, and what results
- **Errors**: Retry logic, fallbacks

## 3. Use Cases

1. **Debugging**: Understand why EVA made a specific choice
2. **Training Data**: Export trajectories for finetuning
3. **Audit**: Compliance and safety verification
4. **Performance Analysis**: Identify bottlenecks

## 4. Data Structure

### Trajectory File Format

- **Filename**: `TRAJ_{session_id}_{turn_index}.jsonl`
- **Location**: `memory/trajectory/`

### Event Types

```json
{"timestamp": "2026-01-15T02:20:00", "type": "llm_call", "data": {...}}
{"timestamp": "2026-01-15T02:20:01", "type": "tool_call", "data": {...}}
{"timestamp": "2026-01-15T02:20:02", "type": "decision", "data": {...}}
{"timestamp": "2026-01-15T02:20:03", "type": "error", "data": {...}}
```

## 5. Privacy Considerations

- **Redaction**: Config option to auto-redact PII
- **Retention**: Auto-cleanup after N days
- **Verbosity Levels**:
  - `minimal`: Only metadata (no full prompts)
  - `standard`: Prompts + truncated outputs
  - `full`: Complete trace (for debugging)

## 6. Integration

- **Orchestrator**: Wraps LLM and tool calls
- **SessionManager**: Flushes trajectory at session end
- **MSP**: Trajectory is separate from Episodic (Process vs Outcome)

## 7. Configuration

See `operation_system/configs/trajectory_config.yaml` for settings.
