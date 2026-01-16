# 🚨 CRITICAL PRINCIPLES - EVA 9.1.0

> **FOR AI AGENTS WORKING ON THIS CODEBASE**
>
> Read this FIRST before making ANY changes to orchestration or LLM calling logic.

---

## 1. THE CARDINAL RULE: 1-Inference Architecture

### ❌ **WRONG** (Current Implementation)

```python
# Phase 1: LLM Call #1
llm.generate(phase1_prompt, tools=[sync_tool])

# The Gap: Bio processing

# Phase 2: LLM Call #2  ← WRONG! New session
llm.generate(phase2_prompt)

# Phase 3: LLM Call #3  ← WRONG! Another new session
llm.generate(phase3_prompt)
```

### ✅ **CORRECT** (Sequential Function Calling)

```python
# Single LLM Session
response1 = llm.generate(initial_prompt, tools=[sync_tool, propose_tool])

# Extract stimulus from function call
stimulus = response1.tool_calls[0].args

# Execute The Gap (NO LLM)
bio_state = execute_gap(stimulus)

# Continue SAME session with function result
response2 = llm.continue_with_result(bio_state, function_name="sync_biocognitive_state")

# Result: response2 contains final text + memory proposal
```

**Why:**

- Maintains conversation context
- LLM response is truly "embodied" (based on actual physio state)
- Follows Gemini's intended function calling pattern
- Cost efficient (1 conversation = 1 billing cycle)

---

## 2. The Gap MUST Be Preserved

**The Gap** = Biological processing that happens BETWEEN LLM calls (or during function execution)

```
LLM extracts stimulus
        ↓
    [THE GAP]  ← Physio Core, Matrix, Qualia, RAG (NO LLM)
        ↓
LLM generates embodied response
```

**Never:**

- ❌ Let LLM "predict" biological state
- ❌ Skip The Gap and go straight to response
- ❌ Run bio processing in parallel with LLM call

**Always:**

- ✅ Wait for function call to complete
- ✅ Execute bio processing synchronously
- ✅ Feed result back to LLM

---

## 3. Function Calling Pattern

### Gemini's Native Pattern

```python
# Step 1: LLM calls function
response = model.generate(prompt, tools=[...])
if response.tool_calls:
    function_name = response.tool_calls[0].name
    function_args = response.tool_calls[0].args
    
    # Step 2: Execute function
    result = execute_function(function_name, function_args)
    
    # Step 3: Continue with result
    final = model.continue_with_result(result, function_name)
```

**This is how weather APIs work. This is how EVA MUST work.**

---

## 4. Common Mistakes to Avoid

### ❌ Mistake #1: Treating Phases as Separate Calls

```python
# DON'T DO THIS
phase1 = llm.generate(phase1_prompt)
phase2 = llm.generate(phase2_prompt)  # Lost context!
```

### ❌ Mistake #2: Not Using `continue_with_result()`

```python
# DON'T DO THIS
stimulus = llm.generate("extract stimulus")
bio_state = process_gap(stimulus)
# Start NEW session without bio_state context
response = llm.generate("now respond")  # LLM doesn't know about bio_state!
```

### ❌ Mistake #3: Passing Bio State as Text

```python
# DON'T DO THIS
bio_state = {"hormones": {}, ...}
llm.generate(f"Here's the state: {bio_state}. Please respond.")
# Should use continue_with_result(bio_state) instead
```

---

## 5. If You're About to Change Orchestration Logic

**STOP and ask yourself:**

1. ✅ Am I maintaining single LLM session per turn?
2. ✅ Am I using `continue_with_result()` for function responses?
3. ✅ Is The Gap executing synchronously between function call and continuation?
4. ✅ Is the final response truly embodied (based on actual bio state)?

If answer is **NO** to any of these → **DON'T PROCEED**

---

## 6. Required Reading Before Changes

Before modifying:

- `orchestrator/orchestrator.py`
- `operation_system/llm_bridge/llm_bridge.py`
- Any phase injection logic in `orchestrator/cim/`

**YOU MUST READ:**

1. This file (`CRITICAL_PRINCIPLES.md`)
2. `docs/BIO_DIGITAL_GAP_FLOW.md`
3. `docs/eva_organism_model.md`

---

## 7. Testing Checklist

After ANY orchestration changes:

```bash
# 1. Count LLM API calls
python eva_cli.py
# Input: "สวัสดี"
# Expected: 2 API requests (initial + continuation)
# If > 2: YOU BROKE IT

# 2. Check debug logs
# Must see:
[LLM] Sending request to Gemini...
[LLM] ✓ Received response
⚡ STEP 2: The Gap - Bio-Digital Sync
[LLM] Continuing session with sync_biocognitive_state result...
[LLM] ✓ Continuation received

# 3. Verify response quality
# EVA's response should reflect the extracted stimulus
```

---

## 8. Emergency Rollback

If you break orchestration:

```bash
git checkout orchestrator/orchestrator.py
git checkout operation_system/llm_bridge/llm_bridge.py
```

Or restore from:

- `orchestrator/archive/orchestrator_legacy.py` (if exists)

---

---

## 4. 1-INFERENCE ARCHITECTURE (THE GOLDEN RULE)

**Principle:** EVA must think and feel in a **SINGLE CONTINUOUS COGNITIVE STREAM**.
**Violation:** Breaking the thought process into multiple disconnected LLM calls (Phase 1 call -> Stop -> Phase 2 call) is strictly forbidden. It causes "Lobotomy" (Amnesia).

### The Mandate

1. **One Session per Turn:** You must use a persistent Chat Session object for the entire turn.
2. **Function Calling for The Gap:** The transition from Perception (Step 1) to Reasoning (Step 3) MUST occur via a **Tool/Function Call** (`sync_biocognitive_state`).
    - *Why?* Because the function result acts as the "Sensory Input" that enters the conscious mind.
3. **No "Restarting":** Never re-initialize the LLM or reload history in the middle of a turn.

### The Flow

- **Step 1 (Pre-Infer):** LLM sees Input -> Calls Function.

- **Step 2 (The Gap):** System runs Physics/Biology/RAG locally.
- **Step 3 (Post-Infer):** LLM receives Bio-State -> Generates Response.

## 📌 Summary

**The Golden Rule:**
> **1 Turn = 1 LLM Session = 1 Continuous Thought Stream**

Never introduce changes that violate this principle. When in doubt, strictly follow `orchestrator.py` patterns.

---

## 9. PROTOCOL: Code Integrity & Ghost Keys

**"Config is the Law. Code is the Enforcer."**

All changes to the system logic, parameters, or behavior must follow the **Schema-First** workflow.

### The Rule

**NEVER** write code that contains "Magic Numbers", hardcoded rules, or hidden logic parameters. All such values must be defined in the System Configuration (YAML) first.

### The Workflow (Ghost Key Driven Development)

1. **Define in YAML:** Create the parameter/rule in the appropriate `*.yaml` config file.
2. **Verify Ghost Status:** Run `ris_subagent.py` to confirm it appears as a "Ghost Key" (Unused).
3. **Implement in Code:** Write the Python logic to consume that specific config key.
4. **Clear the Ghost:** Run `ris_subagent.py` again to confirm the key is now Used.

**Violation:** writing code like `if time > 30:` without a corresponding `session_timeout: 30` in YAML is a violation of System Integrity.
