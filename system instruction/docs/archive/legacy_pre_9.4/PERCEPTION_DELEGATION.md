# Perception Delegation & Cognitive Learning Loop

**Version:** EVA 9.2.0-C9  
**Status:** Production  
**Last Updated:** 2026-01-12

---

## Overview

The **Perception Delegation** system is EVA's implementation of **Dual-Process Theory** (Kahneman's System 1/System 2). It enables efficient cognitive resource allocation by allowing the main LLM (Gemini) to **delegate** rapid perception tasks to a lightweight SLM (Llama-3.2-1B) when it has high confidence in the SLM's intuitive assessment.

### Core Philosophy

> **"Trust your instincts when you're certain they're reliable."**

The system implements a **0.9 confidence threshold**: The LLM only delegates stimulus vector generation to the SLM when it evaluates the SLM's "gut feeling" with >90% confidence. This ensures that:

1. **Simple, clear inputs** → SLM handles perception (fast, efficient)
2. **Complex, ambiguous inputs** → LLM refines perception (accurate, nuanced)

---

## Architecture

### The 3-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Perception (Dual-System)                           │
├─────────────────────────────────────────────────────────────┤
│ User Input → SLM (System 1: Gut Feeling)                   │
│           → LLM (System 2: Reflection)                     │
│           → Confidence Evaluation (>0.9 → Delegate)         │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Processing (The Gap)                               │
├─────────────────────────────────────────────────────────────┤
│ Stimulus Vector → Physio Core → Bio-State                  │
│                 → EVA Matrix → Emotion Label                │
│                 → Agentic RAG → Memory Retrieval            │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Reasoning                                          │
├─────────────────────────────────────────────────────────────┤
│ Bio-State → LLM → Final Response                           │
│          → Memory Proposal                                  │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Persistence & Learning                             │
├─────────────────────────────────────────────────────────────┤
│ Episodic Memory (MSP) ← Refined Metadata                   │
│ Vector DB (Chroma) ← User Input + LLM Intent/Emotion       │
│ Knowledge Graph (Neo4j) ← Bio-Resonance Links              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. SLM Bridge (System 1)

**File:** `services/slm_bridge/slm_bridge.py`  
**Model:** Llama-3.2-1B (via Ollama)  
**Output Schema:** `services/slm_bridge/schema/slm_output_schema.json`

**Responsibilities:**

- Extract **Intent** (short summary of user's goal)
- Identify **Salience Anchor** (trigger phrase)
- Generate **Gut Vector** (Valence, Arousal, Stress, Warmth)
- Provide **Emotional Signal** (initial gut feeling)

**Example Output:**

```json
{
  "intent": "User wants to test the logging system",
  "salience_anchor": "ทดสอบระบบ logging",
  "emotional_signal": "Curious",
  "gut_vector": {
    "valence": 0.6,
    "arousal": 0.4,
    "stress": 0.2,
    "warmth": 0.7
  }
}
```

### 2. LLM Bridge (System 2)

**File:** `operation_system/llm_bridge/llm_bridge.py`  
**Model:** Gemini 2.0 Flash (Thinking)  
**Tool Schema:** `operation_system/llm_bridge/schema/sync_biocognitive_state_schema.json`

**Responsibilities:**

- Receive SLM's gut feeling
- Reflect on accuracy and nuance
- **Evaluate confidence** (0.0 - 1.0)
- **Delegate** if confidence > 0.9, otherwise refine

**Tool Call Example (High Confidence - Delegation):**

```json
{
  "stimulus_id": "casual_greeting",
  "stimulus_vector": null,  // Delegated to SLM
  "intent": "User is greeting casually",
  "salience_anchor": "สวัสดี",
  "rim_impact": 0.3,
  "tags": ["greeting", "social"],
  "confidence_score": 0.95  // >0.9 → Delegation
}
```

**Tool Call Example (Low Confidence - Refinement):**

```json
{
  "stimulus_id": "emotional_ambiguity",
  "stimulus_vector": {  // LLM provides refined vector
    "stress": 0.4,
    "warmth": 0.3,
    "arousal": 0.6,
    "valence": 0.2
  },
  "intent": "User expressing mixed emotions (frustration + hope)",
  "salience_anchor": "ไม่รู้จะทำยังไงดี",
  "rim_impact": 0.7,
  "tags": ["confusion", "emotional_complexity"],
  "confidence_score": 0.6  // <0.9 → LLM overrides
}
```

### 3. Orchestrator (Integration)

**File:** `orchestrator/orchestrator.py`

**Key Logic:**

```python
# Step 1: Get SLM gut feeling
slm_result = slm.extract_intent(user_input)

# Step 1: LLM reflects and decides
response = llm.call_with_tools([SYNC_BIOCOGNITIVE_STATE_TOOL])
confidence = response.tool_calls[0].args.get("confidence_score", 0.5)

# Delegation logic
if confidence > 0.9:
    stimulus_vector = slm_result["gut_vector"]
    safe_print("  ✓ Perception delegated to SLM (High Confidence)")
else:
    stimulus_vector = response.tool_calls[0].args.get("stimulus_vector", {})
    safe_print("  ⚠ LLM refined perception (Low Confidence)")

# Step 4: Cognitive Learning Loop
vector_db.add_memory(
    text=user_input,
    metadata={
        "intent": stimulus.get("intent"),  # LLM's refined intent
        "emotional_signal": stimulus.get("emotional_signal"),
        "confidence": confidence,
        "slm_gut_vector": slm_result["gut_vector"]
    }
)
```

---

## Cognitive Learning Loop

### The Problem It Solves

**Before (No Learning):**

- SLM makes mistake: "ไม่อยากคุยด้วยแล้ว" → `Angry` (wrong!)
- LLM corrects: Actually `Playful Sarcasm`
- **Next time:** SLM makes the **same mistake** again

**After (With Learning):**

- SLM makes mistake initially
- LLM corrects and stores: `{text: "ไม่อยากคุยด้วยแล้ว", intent: "Playful Sarcasm"}`
- **Next time:** RAG retrieves this corrected memory
- SLM sees: "Oh, similar phrase was `Playful Sarcasm` last time"
- **SLM learns** from LLM's past corrections

### Implementation

**Storage Location:** `eva/memory/vector_store/` (ChromaDB)  
**Embedding Model:** `intfloat/multilingual-e5-base` (768D)

**Indexed Fields:**

- `text`: Raw user input (embedded)
- `intent`: LLM's refined intent label
- `emotional_signal`: LLM's refined emotion
- `tags`: Semantic tags
- `confidence`: LLM's confidence score
- `session_id`, `timestamp`: Context

**Query Flow:**

```python
# Future interaction
user_input = "ไม่อยากคุยด้วยแล้วละ"  # Similar to previous

# Step 1: Vector RAG retrieval
memories = vector_db.query_memory(user_input, n_results=3)
# Returns: [{text: "ไม่อยากคุยด้วยแล้ว", 
#            metadata: {intent: "Playful Sarcasm", ...}}]

# Step 1: SLM sees previous examples
slm_prompt += f"Similar past: {memories[0]['metadata']['intent']}"

# Result: SLM now guesses "Playful Sarcasm" correctly!
```

---

## Schema Updates

### 1. Episodic Memory Schema

**File:** `eva/memory_n_soul_passport/schema/Episodic_Memory_Schema_v2.json`

**Added Fields:**

```json
{
  "turn_user": {
    "affective_inference": {
      "intent": "string",          // NEW
      "emotion_signal": "string",
      "confidence": "number",
      "slm_gut_vector": {          // NEW
        "valence": "number",
        "arousal": "number",
        "stress": "number",
        "warmth": "number"
      }
    }
  }
}
```

### 2. Episodic Log Schema

**File:** `eva/memory_n_soul_passport/schema/Episodic_Log_Schema.json`

**Added Fields:**

```json
{
  "intent": "string",              // NEW
  "confidence_score": "number"     // NEW
}
```

### 3. Graph Schema (Neo4j)

**File:** `docs/GRAPH_SCHEMA_DESIGN.md`

**Updated EPISODE Node:**

```cypher
CREATE (e:EPISODE {
  id: "EVA_EP_...",
  content: "...",
  intent: "...",              // NEW
  confidence_score: 0.95,     // NEW
  timestamp: "2026-01-12T...",
  resonance_index: 0.8
})
```

---

## Performance Implications

### Resource Savings

| Scenario | Without Delegation | With Delegation (0.9) | Savings |
|----------|-------------------|---------------------|---------|
| Simple Greeting | Gemini (Flash) | Llama-3.2-1B | ~80% tokens |
| Complex Emotion | Gemini (Flash) | Gemini (Flash) | 0% |
| Average Mix | 100% Gemini | ~60% Gemini + 40% SLM | ~30% cost |

### Accuracy Trade-offs

| Confidence Range | Delegation | Accuracy | Notes |
|-----------------|-----------|----------|-------|
| 0.0 - 0.5 | Never | N/A | LLM handles all |
| 0.5 - 0.8 | Never | N/A | LLM refines |
| 0.8 - 0.9 | Threshold | ~85% | Risky zone |
| 0.9 - 1.0 | **Always** | ~95% | Safe delegation |

---

## Configuration

**File:** `orchestrator/configs/orchestrator_configs.yaml`

```yaml
orchestrator:
  parameters:
    perception_delegation:
      enabled: true
      confidence_threshold: 0.9
      slm_model: "llama3.2:1b"
      
    cognitive_learning:
      enabled: true
      vector_indexing: true
      refined_metadata: true
```

**File:** `operation_system/llm_bridge/llm_bridge.py`

```python
SYNC_BIOCOGNITIVE_STATE_TOOL = {
    "name": "sync_biocognitive_state",
    "description": """
    If your confidence in the SLM's gut feeling is >0.9, 
    omit 'stimulus_vector' to delegate. Otherwise, provide 
    a refined 4D vector.
    """,
    "parameters": {
        "confidence_score": {
            "type": "number",
            "description": "0.0-1.0. >0.9 triggers delegation."
        }
    }
}
```

---

## Monitoring & Debugging

### Context Storage

**Directories:** `eva/consciousness/context_storage/`

- `step1_perception/context_*_step1_perception.json`: SLM + LLM perception data
- `step2_processing/context_*_step2_processing.json`: Bio-state results
- `step3_reasoning/context_*_step3_reasoning.json`: Final response + memory proposal

### Logs to Watch

```bash
# SLM extraction
[SLM] Intent: User wants to test logging
[SLM] Gut Vector: {valence: 0.6, ...}

# LLM evaluation
[LLM] Confidence: 0.95 (HIGH)
[Orchestrator] ✓ Perception delegated to SLM

# Learning loop
[Learning] Indexing interaction in Vector DB with refined metadata...
[ChromaBridge] Successfully added memory: ctx_5_EVA_EP35
```

---

## Future Enhancements

1. **Adaptive Threshold**: Dynamically adjust confidence threshold based on SLM accuracy over time.
2. **SLM Fine-tuning**: Use LLM corrections to fine-tune the SLM on user-specific patterns.
3. **Multi-Level Delegation**: Delegate not just vector generation, but also memory retrieval.
4. **Confidence Calibration**: Implement confidence calibration techniques (Platt scaling).

---

## References

- **System 1/System 2**: Kahneman, D. (2011). *Thinking, Fast and Slow*
- **Perception Delegation Pattern**: Based on "Teacher-Student" distillation in ML
- **Cognitive Learning Loop**: Inspired by Active Learning and Human-in-the-Loop ML

