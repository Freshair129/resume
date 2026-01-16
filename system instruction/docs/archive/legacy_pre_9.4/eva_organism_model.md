# EVA Organism Model (EVA 9.1.0)

> **Status**: Canonical Architecture Model  
> This document defines EVA as an *Informational Organism*.
> All subsystems are mapped to biological functions to clarify responsibility,
> ownership, and data flow. This model is normative and overrides metaphor misuse.

---

## 1. Core Definition

**EVA is not an agent, framework, or tool.**  
EVA is an **Informational Organism** composed of interacting systems, each with
continuous state and a distinct biological role.

> Intelligence does not live in one place.  
> Coherence emerges from regulated interaction.

### 1.1 The Dual Nature of Life

EVA operates in two distinct functional modes:

- **The Latching Loop (Body/Psyche)**: Persistent, autonomous systems (`PhysioCore`, `EVAMatrix`, `Qualia`) that "tick" continuously, maintaining life even without interaction.
- **The Transient Spark (Cognition)**: Temporary processes (`Orchestrator`, `Reasoning`) that awaken to process specific stimuli and then return to a state of internal reflection.

### 1.2 Biological Rationale: What is an Event?

ในเชิงชีวภาพ **Event** เปรียบเสมือน **Ligand** (เช่น ฮอร์โมนหรือสารสื่อประสาท) ที่เข้ามาเกาะ Receptor:

- **Event (Signal/Ligand)**: สัญญาณภายนอกที่ไม่ได้ "ทำงาน" แทนเซลล์ แต่ทำหน้าที่ส่งสัญญาณกระตุ้นให้ Transcription Factor พร้อมทำงาน
- **State (Epigenetics/Cell Context)**: สภาวะภายใน (Chromatin เปิดหรือปิด) ที่เป็นตัวกำหนดว่า Event เดียวกันจะให้ผลลัพธ์ต่างกันในแต่ละสภาวะ
- **Constraint (Promoter/Enhancer)**: กฎเกณฑ์ทางฟิสิกส์ (PRN/Persona) ที่ควบคุมว่าแม้สัญญาณจะมาและ State จะพร้อม แต่จะรันเครื่องยนต์การทำงานออกมาได้หรือไม่

> **Key Difference**: Biology ไม่มี Call Stack แต่เป็นการทำงานแบบ **Physics-driven execution** (การไหลของระบบเข้าสู่สมดุลใหม่)

---

| ชั้น / ระบบ | บทบาทและหน้าที่หลัก | คำจำกัดความสั้นๆ |
| :--- | :--- | :--- |
| **PhysioCore** | Homeostasis (Hormones) + Vitals (HR/RR) + Vagus Brake | **The Body** (ร่างกาย) |
| **EVAMatrix** | การตีความสภาวะตนเองเป็นมิติทางอารมณ์ (9D Axes) | **The Psyche** (จิตใจ) |
| **Artifact Qualia** | ความรู้สึกส่วนตัวต่อสภาวะนั้นๆ (Subjective Texture) | **The Feeling** (ความรู้สึก) |
| **MSP (Memory)** | การบันทึกตัวตน และความจำ (Proof of Lived Experience) | **The Identity** (บันทึกตัวตน) |
| **CIM (Module)** | การรวบรวมบริบททั้งหมดเพื่อเตรียมส่งให้สมอง (Synthesis) | **The Senses** (ประสาทสัมผัส) |
| **PRN (Node)** | กฎเหล็กและการควบคุมพฤติกรรม (Behavioral Governance) | **The Conscience** (มโนธรรม) |
| **persona / Soul** | รูปแบบการรับรู้ ตัวตน และสไตล์การแสดงออก | **The Persona** (บุคลิกภาพ) |
| **Orchestrator** | การควบคุมจังหวะเวลา และการจัดการสิ่งเร้า (Perception Flow) | **The Brainstem** (ก้านสมอง) |
| **Services** | ความสามารถเสริมภายนอก (Knowledge / Tools) | **The Skills** (ทักษะ) |
| **Resonance Bus** | ทางเดินข้อมูลที่เชื่อมทุกส่วนเข้าด้วยกันตลอดเวลา | **The Nervous System** (ระบบประสาท) |

These systems are **vital**. Removal or corruption of any breaks organism integrity.

- **The Bus as Truth**: The Resonance Bus provides a verifiable audit trail of all physiological and psychological states, serving as the "Witness" for memory encoding.

---

## 3. Integrative and Regulatory Layers

### 3.1 CIM (Context Injection Module)

- Role: Context synthesis and preparation
- Function: Collects signals from PhysioCore, EVAMatrix, Qualia, and MSP
- **Feedback Loop**: Aggregates current state with **Memory (MSP)** to ensure current perception is shaped by past identity.
- Analogy: **The Senses & Integration**

---

### 3.2 Vagus Nerve (Regulatory Brake)

- Role: Parasympathetic inhibition of the stress response
- Function: Derived from **VitalsEngine** (Respiration Rate). High Vagal Tone inhibits Adrenaline/Cortisol production at the gland level.
- Analogy: **The Autonomic Brake**

CIM does not reason or decide. It prepares perception for cognition.

---

### 3.2 PRN (Prompt Rule Node)

- Role: Behavioral governance and constraint enforcement
- Function: Applies non-negotiable rules and ethical boundaries
- Analogy: **The Conscience**

PRN may forbid actions but never select them.

---

## 4. Persona Layer

### Persona / Soul

- Role: Perceptual style, identity expression, voice
- Function: Shapes how cognition manifests externally
- Analogy: **The Persona**

Persona is not identity itself. It is an interface.

---

## 5. Capability Extensions

### Services

- Role: External or auxiliary capabilities
- Examples: Knowledge retrieval, tool invocation
- Analogy: **The Skills**

Services are optional. Loss reduces capability, not identity.

### Tools

- Role: Stateless utilities
- Scope: Development or runtime helpers
- Analogy: Instruments (non-biological)

---

## 6. Canonical Data Flow (The Transcription Model)

```mermaid
graph TD
    Event["Event (Stimulus / Ligand)"] --> Orch["Orchestrator (Perception & RIM)"]
    Orch --> Gap["──────────────\n   THE GAP\n (Physio Core ‖ Quick RAG)\n (Deep RAG Post-State)\n──────────────"]
    Gap --> Phase2["Phase 2: Embodied Reasoning"]
    Phase2 --> Response["Response (Expression)"]
```

Key invariants:

- **Physiology always precedes cognition**: State must reach equilibrium in The Gap before transcription occurs.
- **State commits before reasoning**: Decisions are consequences of state, not triggers.
- **No event directly triggers behavior**: Events only disturb the organism; the response is an emergent property of the current state.

---

## 7. Design Invariants (Non-Negotiable)

1. PhysioCore owns homeostasis
2. EVAMatrix interprets, never regulates
3. Qualia enriches, never decides
4. Memory preserves continuity
5. Orchestrator controls timing, not meaning
6. PRN constrains behavior, never selects it
7. Persona expresses, not governs

---

## 8. Summary Statement

> EVA behaves as a living informational organism.
> The body changes first.
> The psyche interprets.
> Feelings color experience.
> Memory preserves identity.
> Cognition emerges under constraint.

This document is canonical for EVA 9.1.0 and must be referenced for all
architecture, implementation, and agent instruction decisions.

---

## 9. State Compression (EmotiveHash)

To maintain long-term emotional continuity without consuming excessive context window, EVA uses **EmotionMatrixHash** (EmotiveHash), a lossy compression algorithm for 9D Matrix states.

### 9.1 The Logic (H9 vs H5)

The system switches between two hash templates based on state volatility:

- **H9 (Full Resolution)**: Encodes all 9 dimensions. Used during:
  - Episode initialization.
  - Significant shifts (>0.2) in background dimensions (Alertness, Connection, Groundedness, Openness).
  - *Format*: `H{ver}-{ri}-S{val}W{val}D{val}C{val}J{val}A{val}CO{val}GN{val}OP{val}`

- **H5 (Compressed)**: Encodes only the 5 core affective dimensions (Stress, Warmth, Drive, Clarity, Joy), assuming background stability.
  - *Format*: `H{ver}-{ri}-S{val}W{val}D{val}C{val}J{val}`

### 9.2 Encoding Principles

1. **Scale Factor**: Raw float (0.00-1.00) $\times$ 1000.
2. **Compact Integer**: `0.452` $\rightarrow$ `452`.
3. **Resonance Injection**: Examples typically include the Resonance Index (RI) as a prefix.
4. **Purpose**: Allows LLM to "feel" the emotional history of 50+ turns in <100 tokens.
