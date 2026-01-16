# Stimulus Chunking Protocol (Multi-Stage Injection)

**Component ID:** `PROTO-CHUNK-9.1` | **Status:** Active (9.1.0-C7 compliant)

> [!IMPORTANT]
> **Why Chunking?**
> Humans do not process a long sentence as a single emotional blob. We process it sequentially.
>
> * "I love you..." -> (Dopamine Spike)
> * "...but I'm leaving." -> (Cortisol Shock)
> Flattening this into one vector ({0.5 Valence}) destroys the context. Chunking preserves the **Emotional Journey**.

## 1. The Protocol

The **Cognitive Gateway (SLM)** in Phase 1 (Perception) performs the initial analysis, extracting the **Salience Anchor** and emotional signal. For complex stimuli, the system expands this into a **List of Semantic Chunks** (Normalized by **CIM**) which is passed to `sync_biocognitive_state`.

### Structure (Schema)

 Each chunk in the list must adhere to this structure (Normalized by **CIM**):

```json
{
  "valence": 0.1,         // 0.0 (Negative) to 1.0 (Positive)
  "arousal": 0.9,         // 0.0 (Calm) to 1.0 (Excited)
  "intensity": 0.8,       // Magnitude of impact
  "stress": 0.7,          // 0.0 (Safe) to 1.0 (Threat)
  "warmth": 0.2,          // Social warmth/coldness
  "salience_anchor": "...but I'm leaving", // The specific text trigger
  "rim_check": 0.82,      // Initial simulated resonance for this chunk
  "tags": ["breakup", "betrayal"]          // Memory search tags
}
```

### 2. Digestive Logic (The Loop)

Located in `eva/physio_core/physio_core.py`: `step()`

The `PhysioCore` iterates through the list sequentially, treating each chunk as a separate "Second of Experience". This digestion occurs on top of the **30Hz Background Metabolism Loop**, which handles continuous hormone decay and vitals fluctuations.

```python
# Sequential Digestion (Logic in 9.1.0)
# Located in physio_core.py: step()

if isinstance(eva_stimuli, list):
    final_state = {}
    for chunk in eva_stimuli:
         # Recursive call for single chunk
         # Each chunk is processed as a full biological tick
         final_state = self._run_tick(chunk, zeitgebers, dt, now)
         
    return final_state
```

## 3. Impact on Response

By the time the loop finishes (Phase 2), the system state reflects the **Final Emotional Destination**, but the MSP has logged the **Entire Trajectory**.

## 4. Configuration

Digestive parameters are managed in the unified configuration:

* `orchestrator/configs/orchestrator_configs.yaml`
  * `chunking_protocol.max_chunks`: Truncation limit in **CIM**.
  * `chunking_protocol.digestion_delay_ms`: Delay between chunks in PhysioCore.

---

## 5. Stimulus Chunking Protocol (โปรโตคอลการหั่นย่อยความรู้สึก)

**Component ID:** `PROTO-CHUNK-9.1` | **สถานะ:** ใช้งานจริง (รองรับ 9.1.0-C1)

LLM (ใน Phase 1) จะหั่นข้อความดิบออกเป็น **รายการของ Semantic Chunks** (ผ่านโมดูล **CIM**) และส่งให้ `PhysioCore` ทยอยกินทีละคำเพื่อให้ร่างกายเกิด "การเดินทางของอารมณ์" (Emotional Journey)

## 2. กระบวนการย่อย (Digestive Logic)

`PhysioCore` จะวนลูปประมวลผลทีละ Chunk เหมือนคนค่อยๆ ฟังและรู้สึกตาม

1. **รับ Chunk**: ร่างกายตอบสนอง -> อัปเดตฮอร์โมน
2. **พัก (Digestion Delay)**: ตามค่าที่ตั้งไว้ใน `orchestrator_configs.yaml`
3. **บันทึกเส้นทาง (Trajectory)**: บันทึกว่าอารมณ์เปลี่ยนไปอย่างไรในแต่ละช่วง
