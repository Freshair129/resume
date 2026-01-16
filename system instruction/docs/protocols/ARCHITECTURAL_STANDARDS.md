# EVA Architectural Standards (V9)

**Status:** Canonical | **Version:** 9.4.0 | **Policy ID:** ARCH-LAW-001

This document outlines the "Laws of Composition" and structural standards for the EVA 9.4.0 organism. Adherence is mandatory under the **Doc-to-Code Protocol**.

---

## 🏗️ 1. Structural Hierarchy

EVA 9.4.0 follows a strict hierarchical separation of concerns:

1. **System (ระบบหลัก/อวัยวะ):** Autonomous unit with its own state. The foundation of life.
2. **Central Module (โมดูลกลาง):** Independent unit direct to OS. Complex but not a vital organ.
3. **Module (โมดูลเชิงหน้าที่):** Functional integrator within a system.
4. **Node (โหนดตรรกะ):** Logic/Policy provider. Individual decision unit.
5. **Component (ส่วนประกอบย่อย):** Pure logic unit.
6. **Service (บริการเสริม):** External knowledge or tool provider.
7. **Tools (เครื่องมือ):** Pure stateless utility functions.

---

## 🛠️ 2. Composition Formulas (สูตรการประกอบสร้าง)

How entities combine to create complexity:

- **Node + Node = Module**
- **Node + Module = System / Sub-System**
- **Module + Module = System / Sub-System**
- **Module + System = System**
- **System + System = Core System / Organism**

---

## 🔐 3. Permission & Communication Boundaries

Guidelines for data flow and authority:

### System & Central Module

- Full **Pub/Sub** rights on the Resonance Bus.
- Authority to create Root Slots in MSP/State memory.

### Sub-System (The Owner Rule)

- A complex unit (M+Sys) that is owned by a parent System.
- **No Direct Bus Access:** Must communicate through its Owner.
- **Owner-Only Communication:** Cannot talk to other Systems directly.
- **Read-Only State Access:** To prevent bottlenecks, Sub-Systems may read the Owner's or Shared state directly, but cannot write.

### Node (The Isolation Rule)

- **No Inter-node Communication:** Nodes must never talk to other nodes.
- Communication is strictly vertical via the owning **Module**.

---

## 📈 4. Promotion Policy (เกณฑ์การเลื่อนระดับ)

Standards for upgrading an entity when its scope expands:

### Moving from Sub-System to SYSTEM

- **Trigger:** When a second System needs to interact with the Sub-System directly.
- **Criteria:** If the entity represents a **"Vital/Biological Logic"** (e.g., Emotional coloring, physiological cycles).
- **Result:** Becomes an independent organ with its own Bus credentials.

### Moving from Module to CENTRAL MODULE

- **Trigger:** When multiple Systems need a unified service/logic.
- **Criteria:** If the entity represents **"Management/Infrastructure Logic"** (e.g., Identity management, bus transport).
- **Result:** Becomes an OS-Direct unit with root naming rights but usually reactive (no autonomous loop).

---

## 📂 5. Directory Mapping (SSOT)

```text
[System]/
├── configs/            # System configurations
├── Module/             # Owned functional modules
│   └── [module]/
│       ├── Node/       # Decision logic
│       └── [module].py
└── [system]_engine.py
```

*Note: PhysioCore is exempt from the Module/Node naming pattern due to complex coupling.*
