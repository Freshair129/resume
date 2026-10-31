import test from 'node:test';
import assert from 'node:assert/strict';
import { AnswerService } from '../server/agent/answer.mjs';

const row={node_id:'design-node',project_slug:'atlas-store',title:{en:'AtlasStore'},text:'Architecture: A Rust engine with graph and vector structures. Outcome: Advanced prototype; runtime benchmarks were not verified.',url:'https://example.org/approved-design',source_id:'approved-document',generation:'active-g1',epoch:1};
const summary={sentences:[{text:'เอกสารอธิบาย Rust engine ที่มีโครงสร้างกราฟและเวกเตอร์',evidence:[{id:'S1',quote:'A Rust engine with graph and vector structures.'}]}]};
const search={search:async()=>({results:[{node_id:row.node_id}],status:'available'})};

test('an empty capability response can explain approved documented design without asserting a search API',async()=>{
 const calls=[];
 const answers=new AnswerService({authorize:async()=>[{...row}]},search,{summarize:async(input,options)=>{
  calls.push({input,options});return calls.length===1?{sentences:[]}:summary;
 }});
 const answer=await answers.answer('AtlasStore รองรับการค้นหาแบบไหนบ้าง');
 assert.equal(answer.confidence,'grounded_summary');assert.equal(answer.status,'documented_design');
 assert.match(answer.answer,/เอกสาร/);assert.match(answer.answer,/กราฟและเวกเตอร์/);
 assert.equal(answer.citations[0].url,row.url);assert.equal(calls.length,2);
 assert.match(calls[1].input.question,/documented architecture/i);
 assert.ok(calls[1].options.timeoutMs>=8000&&calls[1].options.timeoutMs<=12000);
 assert.equal(calls[1].input.sources[0].text,row.text);
});

test('missing metrics, personal facts, closed feature requests, unmatched projects and unrelated evidence do not get design substitutions',async()=>{
 for(const [message,source]of[
  ['How many AtlasStore search users are there?',row],
  ['AtlasStore มีผู้ใช้ระบบค้นหากี่คน',row],
  ['AtlasStore รองรับ BM25 search หรือไม่',row],
  ['UnknownStore รองรับการค้นหาแบบไหนบ้าง',row],
  ['AtlasStore รองรับการค้นหาแบบไหนบ้าง',{...row,text:'Only repository ownership has been reviewed.'}],
 ]){
  let calls=0;
  const answer=await new AnswerService({authorize:async()=>[source]},search,{summarize:async()=>{calls++;return {sentences:[]};}}).answer(message);
  assert.equal(answer.confidence,'none');assert.deepEqual(answer.citations,[]);assert.equal(calls,1);
 }
});

test('revocation before a design follow-up prevents the second provider call',async()=>{
 let modelCalls=0;
 const service=new AnswerService({authorize:async()=>modelCalls?[]:[{...row}]},search,{summarize:async()=>{modelCalls++;return {sentences:[]};}});
 const answer=await service.answer('AtlasStore รองรับการค้นหาแบบไหนบ้าง');
 assert.equal(answer.confidence,'none');assert.equal(answer.status,'publication_changed');assert.equal(modelCalls,1);assert.deepEqual(answer.citations,[]);
});

test('a source update while generating a design description invalidates its answer and citations',async()=>{
 let calls=0;
 const service=new AnswerService({authorize:async()=>[{...row,epoch:calls===2?2:1}]},search,{summarize:async()=>++calls===1?{sentences:[]}:summary});
 const answer=await service.answer('AtlasStore รองรับการค้นหาแบบไหนบ้าง');
 assert.equal(calls,2);assert.equal(answer.confidence,'none');assert.equal(answer.status,'publication_changed');assert.deepEqual(answer.citations,[]);
});
