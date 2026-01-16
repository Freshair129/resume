# Changelog

All notable changes to the EVA Core project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [9.4.0-Refactor] - 2026-01-13

## [9.4.2-ArchitectureConsolidation] - 2026-01-15

### Added

- **Trajectory System**: Implemented execution trace logger for capturing LLM reasoning, tool calls, and decision points.
  - **Engine**: `operation_system/trajectory/trajectory_manager.py`
  - **Config**: `operation_system/configs/trajectory_config.yaml`
  - **Concept**: `docs/systems/trajectory/Trajectory_Concept.md`
- **4-Layer Resonance Architecture**: Unified RTI, MRF, and APM into cohesive `ResonanceEngine`.
  - **Engine**: `operation_system/resonance_engine/resonance_engine.py`
  - **Config**: `operation_system/resonance_engine/configs/resonance_config.yaml`
  - **Concept**: `docs/systems/resonance_engine/Resonance_Engine_Concept.md`
- **MRF Engine**: Migrated Metacognitive Re-contextualization Framework to OS as Central Module.
  - **Location**: `operation_system/mrf_engine/`
  - **7-Layer Processor** for deep interpretation (Literal → Transcendental)
- **Umbrella Engine**: Created toggle-based safety layer with EMP (Exposure Management Protocol).
  - **Location**: `operation_system/umbrella/`
  - **Features**: State-based protection, graceful degradation, Prime Directive integration.
- **Verification Suite**: Created `tests/test_resonance_engine.py` and `tests/simulate_resonance_comparison.py` for automated and comparative validation.
- **ADR-005**: Formally documented the "Unified 4-Layer Resonance Architecture" decision.
- **Orchestrator V9.4**: Fully integrated the 4-Layer Resonance pipeline into the main processing loop.

### Changed

- **NexusMind**: Relocated from `genesis_knowledge_system/nexus_mind/` to `operation_system/nexus_mind/`
  - **Reason**: Functions as Thinking Mode Controller (Infrastructure), not just Knowledge
  - **Updated Role**: `central_module` (cognitive mode switcher)
- **APM (Archetypal Projection Module)**: Relocated from GKS to `operation_system/archetypal_projection/`
  - **Reason**: Cross-system usage as Central Module
  - **Updated Role**: `central_module` (independent, callable by multiple systems)
- **Architecture Cleanup**:
  - Disabled `TemporalEngine` (requires major refactor)
  - Removed APM and NexusMind from GKS `owned_modules`
  - All Central Modules now consolidated in `operation_system/`

### Updated

- **core_systems.yaml**: Registered Trajectory, Resonance Engine, MRF Engine, Umbrella Engine
- **permissions.yaml**: Added TrajectoryManager to System examples
- **EVA_9.4_Architecture.md**: Updated directory mappings for relocated modules

## [9.4.1-SystemRefactor] - 2026-01-15

### Added

- **Engram System (Conditional Memory)**: Implemented O(1) Scalable Lookup Cache to bypass heavy inference for frequent high-confidence interactions.
  - **Engine**: `capabilities/services/engram_system/engram_engine.py`
  - **Concept**: `docs/systems/memory/Engram_Concept.md`
- **Feature Integration Workflow**: Standardized protocol `integrate_feature.md` for adding new components with strict documentation and registration enforcement.
- **RIM Refactor**: Standardized Resonance Impact Model into `operation_system/rim/` with dedicated config separation.
- **Glossary Updates**: Added GKS and Engram definitions to `glossary.yaml`.
- **Truth Seeked Node**: Implemented `genesis_knowledge_system/grounding/truth_seeker_node.py` ("The Judge") to validate candidate facts against User Block, specifically detecting conflicts (e.g., Shrimp vs Allergy) using the "Grilled Shrimp" logic.
- **Session Manager Module**: Implemented `orchestrator/session_manager/session_manager.py` ("The Boss") to decouple lifecycle management (/start, /stop, timeout) from the main Orchestrator loop.

### Changed

- **Permissions & Registration**: Updated `core_systems.yaml` and `permissions.yaml` to include Engram and RIM, ensuring full architectural consistency.
- **Orchestrator Logic**: Refactored `orchestrator.py` to delegate session control to `SessionManager`, significantly cleaning up the main inference loop.
- **MSP Architecture**: Clarified `end_session` role as purely Storage/Archival, leveraging the new `SessionManager` to handle the validation business logic before/after storage.
- **Documentation**: Updated `EVA_9.4_Architecture.md` to reflect the new `Grounding` Node and `SessionManager` Module structure.

## [9.2.0-C8] - 2026-01-11

### Added

- **Phase 10: Pure Decay Metabolism**: Refactored `BloodEngine` for pure exponential decay (zero-decay) and `EndocrineGland` for Basal Secretion and Physiological Noise (+/- 10% Jitter).
- **Phase 11: Bidirectional Vitals (Vagus Feedback)**:
  - Created `VitalsEngine` (Backend HR/RR, RSA, Vagus Tone calculation).
  - Integrated bidirectional feedback in `PhysioCore`: Respiration (RPM) modulates **Vagus Tone**, which inhibits stress hormone (Adrenaline/Cortisol) production.
  - Heart Rate (BPM) now drives dynamic blood flow (Active Clearance).
- **Living Sandbox UI**:
  - `server.py` (FastAPI) implementation with 30Hz background physiological loop.
  - `run_sandbox_ui.bat` shortcut for ease of use.

## [9.1.0-Resonance] - 2026-01-10

### Added

- **SLM Bridge:** Implemented `Qwen3` (0.6b) as a Cognitive Gateway (Pre-Inference) for accurate Thai intent tagging.
- **Vector Memory:** Implemented `ChromaDB` (Local) with `sentence-transformers` (`multilingual-e5-base`) for robust multilingual semantic search.
- **Pre-Inference Flow:** Added "Cognitive Gateway" step in Orchestrator to inject Intent & Fast Memories before Phase 1 Perception.

### Changed

- **Identity Manager Implementation**: Centralized identity logic into `operation_system/identity_manager.py`.
- **Context ID:** Updated format to be human-readable sequence: `ctx_{session_seq}_{episodic_id}.md` (e.g., `ctx_5_EVA_EP27.md`).
- **Session ID:** Aligned with session memory logic: `SES_{dev_id}_SP{sphere}C{core}_SS{session}`.
- **Identity Logic:** Centralized all ID generation in `IdentityManager`.
- **Cleanup:** Removed legacy `transient_id` and deleted redundant `eva/identity` directory.
- **Architectural Pivot:** Moved from "3-Phase / Multi-Turn" to **"1-Inference / Single-Session"** architecture.
  - Reduced LLM calls from 3 to 1 per turn (plus 1 continuation).
  - Consolidated context injection into "Pre-Inference".
  - Refactored "The Gap" to be a synchronous function call within the same session.
- **Orchestrator:** Renamed processing stages to Step 1 (Perception/Pre-Infer), Step 2 (Gap), Step 3 (Reasoning/Post-Infer).
- **Gemini Bridge:** Implemented robust fallback mechanism for Function Responses (Text Injection Fallback) to resolve `IndexError`.

### Fixed

- **LLM Hang:** Resolved Orchestrator hanging at RAG step by fixing nonexistent method calls.
- **Protocol Mismatch:** Fixed Gemini SDK crash by handling empty candidates during function calling.

### Removed

- **Phase 3 Prediction:** Removed standalone Prediction Phase to simplify the cognitive loop.
- **Split Context Logs:** Stopped generating `context_phase2.json` and `context_phase3.json`; merged all reasoning data into Episodic Memory.
