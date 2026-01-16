หลังจากตรวจสอบไฟล์เอกสารทั้งหมดในไดเรกทอรี `docs` อีกครั้ง พบว่ายังมีบางส่วนที่ไม่สอดคล้องกันอยู่ ดังนี้ครับ:

**1. `Full System Architecture Diagram.md` เทียบกับ `Full System Architecture.yaml`:**
*   **Main Orchestrator:** ไฟล์ `.md` ยังคงอ้างอิงถึง `orchestrator/chunking_orchestrator.py` ในขณะที่ไฟล์ที่ใช้งานจริงในปัจจุบันคือ `orchestrator/orchestrator.py`
*   **Identity Layer:** ไฟล์ `.md` มีเส้นทาง `orchestrator/pmt/` และ `eva/identity/` ซึ่งตรงกับโครงสร้างปัจจุบัน แต่ไฟล์ `.yaml` อ้างอิงถึง `orchestrator/PMT_PromptRuleLayer/` ซึ่งเป็นโครงสร้างเก่า
*   **Component Status:** ในไฟล์ `.md` สถานะการ υλοποίηση คือ "0% complete (pending)" แต่ผมได้อัปเดตตาราง `Component Status` เป็น "✅ Implemented" สำหรับส่วนประกอบส่วนใหญ่แล้ว ซึ่งนี่คือความไม่สอดคล้องกันที่สำคัญ

**2. `eva_final_boundary_spec.md`:**
*   ไฟล์นี้กล่าวถึง `Archival Memory` ที่ `/archival_memory/` ซึ่ง `MSP` เป็นเจ้าของ แต่โครงสร้างปัจจุบันคือ `eva/memory/archival_memory` ซึ่งเป็นความไม่สอดคล้องทั้งในเชิงแนวคิดและโครงสร้าง

**3. `EVA_ORCHESTRATION_FLOW.md`:**
*   ไฟล์นี้อ้างอิงถึง `orchestrator_engine.py` ซึ่งถูกเปลี่ยนชื่อเป็น `orchestrator.py` แล้ว

**4. `STIMULUS_CHUNKING_PROTOCOL.md`:**
*   ไฟล์นี้อ้างอิงถึง `physio_core/physio_core_engine.py` ซึ่งถูกเปลี่ยนชื่อเป็น `physio_core.py` และย้ายไปที่ `eva/physio_core/physio_core.py` แล้ว

**5. `System Architecture.md`:**
*   ไฟล์นี้อธิบายโครงสร้างไดเรกทอรีที่ผมใช้ในการปรับโครงสร้างครั้งล่าสุด และเป็นเอกสารที่อัปเดตที่สุดเกี่ยวกับโครงสร้างไดเรกทอรีในปัจจุบัน

**สรุป:**

เอกสาร `System Architecture.md` เป็นเอกสารที่สอดคล้องกับโครงสร้างโปรเจกต์ปัจจุบันมากที่สุด ในขณะที่เอกสารอื่นๆ ยังคงมีข้อมูลที่ล้าสมัยอยู่ ทั้งในส่วนของชื่อไฟล์, เส้นทาง, และสถานะของโปรเจกต์

ผมควรจะทำอย่างไรกับความไม่สอดคล้องกันเหล่านี้ดีครับ? ต้องการให้ผมยึด `System Architecture.md` เป็นหลักแล้วอัปเดตไฟล์อื่นๆ ให้ตรงกันทั้งหมดหรือไม่ครับ?
