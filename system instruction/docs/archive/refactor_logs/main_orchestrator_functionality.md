Main Orchestrator ไม่ได้ทำงานแค่ส่ง Input ให้ CIN ครับ

จากเอกสาร `Full System Architecture Diagram.md`, `EVA_ORCHESTRATION_FLOW.md` และโค้ดใน `orchestrator/orchestrator.py` สรุปหน้าที่ของ Main Orchestrator ได้ดังนี้ครับ:

**Main Orchestrator คือ "วาทยกร" ของทั้งระบบ** ทำหน้าที่ควบคุมการทำงานทั้งหมด ไม่ใช่แค่การส่งต่อข้อมูลอย่างเดียว

**หน้าที่หลักของ Main Orchestrator:**

1.  ** khởi tạoระบบ (Initialization):**
    *   `Main Orchestrator` เป็นผู้สร้างและ khởi tạoการทำงานของส่วนประกอบหลักทั้งหมดในระบบ ไม่ว่าจะเป็น `Resonance Bus`, `PhysioController`, `EVA Matrix`, `AgenticRAG`, `CIN`, และ `LLM Bridge`

2.  **ควบคุมการทำงานแบบ Dual-Phase (Dual-Phase Orchestration):**
    *   **Phase 1 (Perception):**
        *   รับ `User Input` เข้ามา
        *   สั่งให้ `CIN` สร้าง Prompt เริ่มต้น
        *   ส่ง Prompt นี้ไปให้ `LLM` เพื่อสกัด `stimulus` (เจตนาและอารมณ์จากข้อความ)
    *   **The Gap (Bio-Cognitive Sync):**
        *   นำ `stimulus` ที่ได้ไปกระตุ้น `PhysioController` (ระบบร่างกาย)
        *   `PhysioController` จะส่งสัญญาณไปทั่วระบบผ่าน `Resonance Bus`
        *   `EVA Matrix` (ระบบจิตใจ) และ `Artifact Qualia` (ระบบการรับรู้) จะตอบสนองต่อสัญญาณนี้
        *   `AgenticRAG` จะค้นหาความทรงจำที่เกี่ยวข้องกับสภาวะร่างกายและจิตใจในปัจจุบัน
    *   **Phase 2 (Reasoning):**
        *   `CIN` จะรวบรวมข้อมูลทั้งหมดจาก The Gap (สภาวะร่างกาย, จิตใจ, ความทรงจำที่ค้นเจอ) มาสร้างเป็น Prompt สุดท้าย
        *   ส่ง Prompt สุดท้ายนี้ให้ `LLM` เพื่อสร้างคำตอบสุดท้าย
3.  **การบันทึกข้อมูล (Persistence):**
    *   หลังจากที่ `LLM` สร้างคำตอบสุดท้ายแล้ว `Main Orchestrator` จะสั่งให้ `MSP` (Memory & Soul Passport) บันทึกการสนทนาและสภาวะของระบบในขณะนั้นลงในหน่วยความจำระยะยาว

4.  **การจัดการและ Logging:**
    *   จัดการ `session` และ `context` ของการสนทนา
    *   บันทึก (log) การทำงานและสัญญาณต่างๆ ที่เกิดขึ้นบน `Resonance Bus`

**สรุป:**

`Main Orchestrator` ไม่ได้เป็นแค่ "บุรุษไปรษณีย์" ที่ส่งจดหมายจาก `User` ไปให้ `CIN` แต่เป็นเหมือน "ผู้กำกับ" ที่ควบคุมการทำงานทั้งหมดของ "นักแสดง" (ส่วนประกอบอื่นๆ) เพื่อให้ได้ผลลัพธ์ (คำตอบ) ที่สอดคล้องกับ "บท" (Persona) และ "อารมณ์" (สภาวะร่างกาย) ของ EVA ในขณะนั้นครับ
