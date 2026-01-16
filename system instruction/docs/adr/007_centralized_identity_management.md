# ADR 007: Centralized Identity Management via IdentityManager Factory

* **Status:** Accepted
* **Date:** 2026-01-12
* **Context:** EVA 9.1.0 - Identity Ownership & Configuration Modernization

## Context

Prior to this change, system identifiers and bus channel names were scattered across the codebase:

1. **"Ownerless" IDs:** Turn IDs and bus channel names were hardcoded as magic strings (e.g., `f"TURN_{session_id}_{num:03d}"`, `"bus:physical"`).
2. **Metadata Debt:** Core configuration files (`core_systems.yaml`, `glossary.yaml`, `permissions.yaml`) were outdated (V8.1), containing dead file paths and deprecated terminology.
3. **Fragmented Registries:** No single source of truth for system IDs, bus channels, or persona mappings.
4. **Type Safety Risks:** String literals prone to typos and refactoring errors.

## Decision

We centralized all identity management into the `IdentityManager` factory pattern with three core registries:

### 1. System Registry

Constants for all core system identifiers:

```python
SYSTEM_MSP = "MSP"
SYSTEM_PHYSIO = "PhysioCore"
SYSTEM_MATRIX = "EVA_Matrix"
# ... 9 total systems
```

### 2. Bus Registry

Canonical names for Resonance Bus channels:

```python
BUS_PHYSICAL = "bus:physical"
BUS_PSYCHOLOGICAL = "bus:psychological"
BUS_PHENOMENOLOGICAL = "bus:phenomenological"
BUS_KNOWLEDGE = "bus:knowledge"
```

### 3. Persona Registry

Mapping of persona codes to internal IDs:

```python
PERSONA_MAP = {
    "EVA": "PE_01",
    "LYRA": "PE_02"
}
```

### ID Generation Methods

- `generate_turn_id(session_id, turn_index)` → `TURN_{session_id}_{index:03d}`
* `get_persona_id(persona_code)` → Lookup from PERSONA_MAP

## Implementation

### Refactored Modules

1. **Orchestrator** (`orchestrator.py`):
   * Replaced `f"TURN_{session_id}_{num:03d}"` with `IdentityManager.generate_turn_id()`
   * Used `IdentityManager.BUS_*` for all bus subscriptions

2. **Core Systems** (`PhysioCore`, `EVA_Matrix`, `Artifact_Qualia`):
   * All `bus.subscribe("bus:physical", ...)` → `bus.subscribe(IdentityManager.BUS_PHYSICAL, ...)`

3. **ResonanceBus** (`resonance_bus.py`):
   * Channel initialization uses registry constants

### Configuration Modernization

Updated to V9.1.0 standards:
* **core_systems.yaml**: Corrected file paths, added `id_registry` field
* **glossary.yaml**: Updated terminology (CIN→CIM, Phase→Step)
* **permissions.yaml**: Simplified authority model

## Consequences

### Positive

- **Single Source of Truth**: All IDs defined in one location
* **Type Safety**: IDE autocomplete prevents typo errors
* **Maintainability**: Changing a bus name requires editing only one constant
* **Auditability**: Easy to track ID usage via grep/find-references
* **Documentation**: Registries serve as living documentation of system architecture

### Negative

- **Import Overhead**: All modules must import `IdentityManager`
* **Migration Work**: Existing code required refactoring (completed in this ADR)

## Related Changes

* Resolved documentation linting errors (MD036) in `tools/subagents/README.md` and `docs/GEMINI.md`
* Created audit artifacts: `id_audit.md`, `walkthrough_identity.md`
* Updated `CHANGELOG.md` with v9.1.0-C10 entry
* Updated `GEMINI.md` with enhanced Identity Management section

## Future Considerations

* **GKS Integration**: Will add `SYSTEM_GKS`, `SYSTEM_NEXUS` constants
* **User Grounding**: May need `SYSTEM_CONFLICT_DETECTOR` for semantic memory conflict resolution
* **Dynamic Registration**: Consider runtime registration for plugin systems
