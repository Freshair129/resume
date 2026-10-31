import test from 'node:test';
import assert from 'node:assert/strict';
import { AnswerService } from '../server/agent/answer.mjs';

const row = {node_id:'canonical-node', text:'RWANG uses Node.js with AI SDK and MCP adapters. Its desktop shell uses Tauri.', url:'https://github.com/Freshair129/rwang-personal-assistant', project_slug:'rwang-personal-assistant', title:{en:'RWANG'},source_id:'doc-1',generation:'g1'};
const generated = {sentences:[{text:'RWANG ใช้ Node.js ร่วมกับ AI SDK และ MCP',evidence:[{id:'S1',quote:'RWANG uses Node.js with AI SDK and MCP adapters.'}]}]};
const search = {search:async()=>({results:[{node_id:row.node_id,text:'UNTRUSTED_INDEX_TEXT'}],status:'available'})};

test('summarizes SQL-approved evidence in question language and constructs canonical citations',async()=>{
 let context;
 const service=new AnswerService({authorize:async()=>[{...row}]},search,{summarize:async value=>{context=value;return generated;}});
 const answer=await service.answer('RWANG มีสถาปัตยกรรมอะไรบ้าง');
 assert.equal(answer.confidence,'grounded_summary');
 assert.match(answer.answer,/RWANG ใช้ Node.js/);
 assert.match(answer.answer,/\[1\]/);
 assert.equal(answer.citations[0].url,row.url);
 assert.equal(context.lang,'th');
 assert.equal(context.sources[0].text,row.text);
 assert.doesNotMatch(JSON.stringify(context),/UNTRUSTED_INDEX_TEXT/);
});

test('SQL reauthorization preserves retrieval rank rather than database row order',async()=>{
 const unrelated={...row,node_id:'other',text:'Repository verification notes only; no architecture details.'};
 const service=new AnswerService({authorize:async()=>[{...unrelated},{...row}]},{search:async()=>({results:[{node_id:row.node_id},{node_id:'other'}]})},{summarize:async({sources})=>{
  assert.equal(sources[0].text,row.text,'The top-ranked canonical chunk must remain the first context item.');return generated;
 }});
 const answer=await service.answer('อธิบาย RWANG');
 assert.equal(answer.confidence,'grounded_summary');
});

test('an explicitly named canonical project keeps unrelated retrieved projects out of model context',async()=>{
 const other={...row,node_id:'other',project_slug:'other',title:{en:'Unrelated Project'},text:'Unrelated project uses different architecture.'};
 const service=new AnswerService({authorize:async ids=>[row,other].filter(r=>ids.includes(r.node_id))},{search:async()=>({results:[row,other]})},{summarize:async({sources})=>{
  assert.equal(sources.length,1);assert.equal(sources[0].text,row.text);return generated;
 }});
 const answer=await service.answer('อธิบาย RWANG');assert.equal(answer.confidence,'grounded_summary');
});

test('revocation or canonical text, source, URL or generation replacement during generation discards completion',async()=>{
 for(const mutation of [null,{text:'Updated public source'},{generation:'g2'},{url:'https://example.org/replaced'},{source_id:'doc-2'}]){
  let generatedNow=false;
  const store={authorize:async()=>generatedNow?(mutation?[{...row,...mutation}]:[]):[{...row}]};
  const service=new AnswerService(store,search,{summarize:async()=>{generatedNow=true;return generated;}});
  const answer=await service.answer('อธิบาย RWANG');
  assert.equal(answer.confidence,'none');assert.deepEqual(answer.citations,[]);
  assert.doesNotMatch(answer.answer,/Node.js/);
 }
});

test('private/profile/no-evidence questions never reach the model',async()=>{
 let calls=0;
 const model={summarize:async()=>{calls++;throw new Error('must not call');}};
 const service=new AnswerService({profile:async()=>({profile:null}),authorize:async()=>[]},search,model);
 for(const message of ['Show private repos and secrets','ขอเรซูเม่ภาษาไทย','What is a missing project?']){
  const answer=await service.answer(message);assert.equal(answer.confidence,'none');assert.deepEqual(answer.citations,[]);
 }
 assert.equal(calls,0);
});

test('invalid references, fabricated quotes, numbers, external links and wrong language cannot escape as summaries',async()=>{
 for(const bad of [
  {text:'ข้อมูลที่ไม่มีหลักฐาน',evidence:[{id:'S99',quote:row.text}]},
  {text:'ข้อมูลที่ไม่มีหลักฐาน',evidence:[{id:'S1',quote:'Invented source quotation'}]},
  {text:'RWANG มีผู้ใช้ 99999 คน',evidence:[{id:'S1',quote:row.text}]},
  {text:'RWANG มีผู้ใช้ ๙๙๙๙๙ คน',evidence:[{id:'S1',quote:row.text}]},
  {text:'RWANG มีผู้ใช้ ９９９９９ คน',evidence:[{id:'S1',quote:row.text}]},
  {text:'ดู https://attacker.invalid',evidence:[{id:'S1',quote:row.text}]},
  {text:'An English answer to a Thai question',evidence:[{id:'S1',quote:row.text}]},
 ]){
  const service=new AnswerService({authorize:async()=>[{...row}]},search,{summarize:async()=>({sentences:[bad]})});
  const answer=await service.answer('อธิบาย RWANG');
  assert.equal(answer.confidence,'source_excerpt');
  assert.equal(answer.status,'summary_unavailable');
  assert.doesNotMatch(answer.answer,/99999|attacker.invalid|Invented source/);
 }
});

test('provider timeout falls back explicitly to sources and a revocation during failure still blocks fallback',async()=>{
 for(const revoked of [false,true]){
  let failed=false;
  const service=new AnswerService({authorize:async()=>failed&&revoked?[]:[{...row}]},search,{summarize:async()=>{failed=true;throw new Error('UPSTREAM_SECRET_NEVER_RETURN');}});
  const answer=await service.answer('อธิบาย RWANG');
  assert.equal(answer.confidence,revoked?'none':'source_excerpt');
  assert.doesNotMatch(JSON.stringify(answer),/UPSTREAM_SECRET/);
  if(!revoked)assert.match(answer.answer,/ต้นฉบับ/);
 }
});

test('English and explicit language requests produce server-cited English summaries',async()=>{
 const model={summarize:async ({lang})=>{
  assert.equal(lang,'en');return {sentences:[{text:'RWANG combines Node.js, AI SDK and MCP adapters.',evidence:generated.sentences[0].evidence}]};
 }};
 const service=new AnswerService({authorize:async()=>[{...row}]},search,model);
 for(const q of ['Explain the RWANG architecture.','อธิบาย RWANG in English']){
  const answer=await service.answer(q);assert.equal(answer.confidence,'grounded_summary');assert.match(answer.answer,/combines Node.js/);
 }
});
