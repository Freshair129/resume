# 📜 Protocol: Doc-to-Code (Schema-First)

**"Config is the Law. Code is the Enforcer."**

This protocol enforces a strict direction of flow for all changes in the EVA system. No code should be written without a preceding definition in the Configuration/Documentation (YAML).

## The Principle

**Configuration (YAML) = Source of Truth (The What)**
**Code (Python) = Implementation (The How)**

We do not "hardcode" logic and then optionally expose it. We define the *capability* in the Schema, then write code to fulfill it.

## The Workflow: "Ghost Key Driven Development"

### Step 1: Define (The Doc)

Start by editing the `*.yaml` file (e.g., `orchestrator_configs.yaml`). Add your new feature parameter.

```yaml
# orchestrator_configs.yaml
my_new_feature:
  enabled: true
  threshold: 0.8
```

### Step 2: Audit (The Check)

Run the **RIS Subagent**. It will immediately flag your new config as a **"Ghost Key"** (Unused).

```bash
python tools/subagents/ris_subagent.py --audit-config ...
# Output: [!] POTENTIALLY UNUSED KEYS: my_new_feature
```

**✅ This "Error" is your "Job Ticket".** It confirms you have updated the Doc, but the Code is lagging.

### Step 3: Implement (The Code)

Write the Python code to consume/read that key.

```python
# orchestrator.py
feat_conf = self.config.get("my_new_feature", {}) # Read it!
val = feat_conf.get("threshold")
```

### Step 4: Verify (The Sync)

Run RIS again. The "Ghost Key" warning should disappear.
**Green Light = Feature Complete.**

## Enforcer

The **Resonance Integrity Subagent (RIS)** is the guardian of this protocol.

- **Ghosts** = Unfinished Work (Doc exists, Code missing).
- **Hardcodes** = Illegal Moves (Code exists, Doc missing - *Harder to detect automatically, requires discipline*).

---
*Signed: Antigravity & User*
