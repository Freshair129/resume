# ADR 001: Transition to System-Module-Node Hierarchy (CIM & PromptRule)

## Status
Proposed -> Approved

## Context
The EVA 9.1.0 system requires a more granular architectural hierarchy to support the 3-Phase Autonomic flow. The current naming (CIN/PMT) and flat structure do not clearly represent the functional roles of "Integrator" vs "Rule Provider". 

Additionally, a technical constraint was discovered: Windows reserved device names prevent the use of "PRN" as a folder name.

## Decision
1.  **System-Module-Node Adoption**: Formalize the hierarchy where the Orchestrator is the **System**, Context Injection is the **Module** (CIM), and Prompt Rule is the **Node** (Nested within CIM).
2.  **Naming Alignment**:
    *   `orchestrator/cin` -> `orchestrator/cim` (Context Injection Module)
    *   `orchestrator/pmt` -> `orchestrator/cim/prompt_rule` (Prompt Rule Node - Nested)
3.  **Engine Alignment**:
    *   `cin.py` -> `cim.py` (Class `ContextInjectionModule`)
    *   `pmt.py` -> `prompt_rule_node.py` (Class `PromptRuleNode`) - *Note: The filename MUST NOT be `prn.py` due to Windows system limitations.*
4.  **Configuration**: Update `orchestrator_configs.yaml` to use keys `cim` and `prn` (Config keys are fine, only filenames are restricted).

## Consequences
- **Pros**:
    - Clearer ownership: Prompt Rule Node is strictly owned by CIM.
    - Architectural clarity: Matches the "Informational Organism" documentation.
    - Solves Windows OS compatibility issues.
- **Cons**:
    - Breaking changes for existing scripts relying on old paths/imports.
    - Requires update to all configuration references.

## Rollback Plan
1.  Move files back to their original flat directory structure.
2.  Restore `cin.py` and `pmt.py` names.
3.  Revert `orchestrator_configs.yaml` keys to `cin` and `pmt`.
