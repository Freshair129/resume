# [Module Name] Documentation Standard
**Component ID:** `ARCH-[MODULE-ID]-9.1` | **Status:** [Draft/Operational/Conceptual]

> [!IMPORTANT]
> [Brief summary of the module's core purpose and its distinction from other related modules.]

## 1. Core Concept
[Explanation of the fundamental philosophy or mechanism behind the module. Include equations or key principles if applicable.]

## 2. Architecture Layers / Components
### Layer 1: [Name]
*   **Location**: [Path or Runtime Location]
*   **Role**: [Responsibility]
*   **Persistence**: [How data is stored or maintained]

### Layer 2: [Name]
*   **Location**: [Path or Runtime Location]
*   **Role**: [Responsibility]

## 3. Key Metrics & Logic
*   **[Metric/Logic Name]**: [Description of how it works or what it measures]
*   **[Metric/Logic Name]**: [Description]

## 4. Workflow (Mermaid)
```mermaid
graph TD
    [A] --> [B]
    [B] -- [Condition] --> [C]
    [C] --> [D]
```

## 5. Integration & Interfaces
[Describe how this module interacts with the LLM, the Resonance Bus, or other modules.]
1. **[Component A]**: Interactions...
2. **[Component B]**: Interactions...

## 6. Directory Structure
```
[module_name]/
├── configs/                # Configuration Files
│   ├── [Module]_Interface.yaml  # Bus bindings
│   ├── [Module]_configs.yaml    # Tuning parameters
│   └── [Module]_Write_Policy.yaml # Persistence rules
├── contract/               # Payload Contracts
│   ├── [Module]_Payload_Contract.yaml
│   └── [Module]_Proposal_*.yaml
├── schema/                 # Validation Schemas
│   ├── [Module]_Payload_Schema_v2.json
│   └── [Module]_*.json
├── docs/                   # Internal Documentation
│   ├── [Module]_CONCEPT.md
│   └── [Module]_spec.yaml
├── tests/                  # Unit & Integration Tests
├── archive/                # Deprecated files
└── [module]_engine.py      # Core Logic Engine
```

---

# [Module Name Thai] (ระบบ...)
**Component ID:** `ARCH-[MODULE-ID]-9.1` | **สถานะ:** [แนวคิด/ระบบปฏิบัติการ]

> [!NOTE]
> [คำอธิบายสรุปสั้นๆ ในภาษาไทยเกี่ยวกับหน้าที่หลักของโมดูลนี้]

## 1. แนวคิดหลัก
[คำอธิบายปรัชญาหรือกลไกพื้นฐานของโมดูล]

## 2. โครงสร้างระดับชั้น
### Layer 1: [ชื่อ]
*   **หน้าที่**: [หน้าที่รับผิดชอบ]

## 3. กระบวนการทำงาน
[อธิบายขั้นตอนการทำงานหลักๆ]

## 4. บทบาทของ LLM / ระบบอื่น
[การปฏิสัมพันธ์กับส่วนอื่นๆ ของระบบ]
