import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile,mkdir } from 'node:fs/promises';
import { renderResume } from '../server/pdf/resume.mjs';
test('TH/EN resume outputs are real PDFs with embedded font, unpublished profile denied',async()=>{
 await assert.rejects(()=>renderResume({profile:null}));await mkdir('artifacts',{recursive:true});
 for(const lang of ['th','en']){
  const pdf=await renderResume({profile:{name:{en:'TEST FIXTURE - Not a real resume',th:'ข้อมูลทดสอบ - ไม่ใช่ประวัติจริง'},headline:{en:'AI Automation',th:'ระบบอัตโนมัติ AI'},summary:{en:'Synthetic PDF validation only. No employment or achievements asserted.',th:'เอกสารสำหรับทดสอบการแสดงผลภาษาไทยเท่านั้น ไม่มีการรับรองประสบการณ์หรือผลงาน'},contacts:{}},experiences:[],projects:[]},{lang});
  assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.ok(pdf.length>2000);assert.match(pdf.toString('latin1'),/FontFile2/);await writeFile(`artifacts/resume-fixture-${lang}.pdf`,pdf);
 }
});
