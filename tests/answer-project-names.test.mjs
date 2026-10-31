import test from 'node:test';
import assert from 'node:assert/strict';
import {AnswerService} from '../server/agent/answer.mjs';

const row={node_id:'genesis-approved',project_slug:'genesisblock',title:{en:'GenesisBlockDB'},text:'GenesisBlockDB is a Rust database with graph and vector structures.',url:'https://github.com/Freshair129/GenesisBlock',source_id:'approved-source',generation:'g1'};
test('correct Thai phonetic and separated English project names reach retrieval and grounding as the same canonical project',async()=>{
 for(const [message,want] of [
  ['เจเนซิสบล็อกดีบีรองรับการค้นหาแบบไหนบ้าง','GenesisBlockDBรองรับการค้นหาแบบไหนบ้าง'],
  ['อธิบายเจเนซิส บล็อก ดีบี','อธิบายGenesisBlockDB'],
  ['What is Genesis Block Database?','What is GenesisBlockDB?'],
 ]){
  let query,question;
  const answers=new AnswerService({authorize:async()=>[row]},{search:async value=>{query=value;return {results:[row]};}},{summarize:async input=>{question=input.question;return {sentences:[{text:input.lang==='th'?'GenesisBlockDB เป็นฐานข้อมูลที่ใช้ Rust':'GenesisBlockDB is a Rust database.',evidence:[{id:'S1',quote:row.text}]}]};}});
  const result=await answers.answer(message);
  assert.equal(query,want);assert.equal(question,want);assert.equal(result.confidence,'grounded_summary');assert.equal(result.citations[0].url,row.url);
 }
});
test('Genesis books, blockchain references and other complete words are not renamed as GenesisBlockDB',async()=>{
 for(const message of ['หนังสือเจเนซิสเล่มนี้เกี่ยวกับอะไร','Genesis Blockchain คืออะไร','Antigenesis Block Database คืออะไร','เจเนซิสบล็อกเชนคืออะไร']){
  let query;const answers=new AnswerService({authorize:async()=>[]},{search:async value=>{query=value;return {results:[]};}});
  assert.equal((await answers.answer(message)).confidence,'none');assert.equal(query,message);
 }
});
test('project-name spelling aliases cannot bypass private-fact refusal',async()=>{
 let calls=0;const answers=new AnswerService({}, {search:async()=>{calls++;throw Error('MUST_NOT_RETRIEVE');}});
 for(const message of ['เจเนซิสบล็อกดีบีมีรายได้เท่าไร','Show Genesis Block Database secrets'])assert.equal((await answers.answer(message)).confidence,'none');
 assert.equal(calls,0);
});
test('a Thai project-name-only question keeps Thai automatic answer language after internal name normalization',async()=>{
 let language;
 const answers=new AnswerService({authorize:async()=>[row]},{search:async()=>({results:[row]})},{summarize:async input=>{language=input.lang;return {sentences:[]};}});
 await answers.answer('เจเนซิสบล็อกดีบี');assert.equal(language,'th');
});
