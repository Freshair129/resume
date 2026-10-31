import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { verifyLineSignature,enqueueLine,deliverLine } from '../server/adapters/line.mjs';
async function setup(){const db=new PGlite();await db.exec(await readFile('postgres/migrations/001_knowledge.sql','utf8'));return db;}
const raw=id=>Buffer.from(JSON.stringify({events:[{webhookEventId:id,type:'message',replyToken:'fixture-reply',message:{type:'text',text:'GenesisBlockDB คืออะไร'}}]}));

test('non-ASCII signature cannot crash the HMAC boundary',()=>{
 assert.equal(verifyLineSignature(Buffer.from('{}'),'ก'.repeat(44),'fixture'),false);
});
test('text payload must contain a nonempty question before enqueue',async()=>{
 const db=await setup();try{for(const text of [undefined,'','   '])await assert.rejects(()=>enqueueLine(db,Buffer.from(JSON.stringify({events:[{webhookEventId:'bad',type:'message',replyToken:'x',message:{type:'text',text}}]}))));assert.equal((await db.query('SELECT * FROM line_deliveries')).rows.length,0);}finally{await db.close();}
});
test('LINE reply preserves all numbered citation URLs and purges delivered payload',async()=>{
 const db=await setup();let sent;
 try{await enqueueLine(db,raw('citations'));
  await deliverLine(db,{answer:async()=>({answer:'Approved design [1] [5]',citations:Array.from({length:5},(_,i)=>({title:`Source ${i+1}`,url:`https://github.com/example/repo/blob/${'a'.repeat(40)}/README-${i+1}.md`}))})},{token:'fixture',fetchImpl:async(_url,options)=>{sent=JSON.parse(options.body);return new Response('{}');}});
  const text=sent.messages.map(m=>m.text).join('\n');assert.match(text,/\[5\] Source 5/);assert.match(text,/README-5.md/);assert.ok(sent.messages.every(m=>m.text.length<=5000));
  const row=(await db.query("SELECT * FROM line_deliveries WHERE id='citations'")).rows[0];assert.equal(row.state,'done');assert.equal(row.payload,null);
 }finally{await db.close();}
});
test('expired generation never sends a reply token after answering',async()=>{
 const db=await setup();let calls=0;
 try{await enqueueLine(db,raw('expiry'));await deliverLine(db,{answer:async()=>{await db.query("UPDATE line_deliveries SET expires_at=now()-interval '1 second' WHERE id='expiry'");return {answer:'answer',citations:[]};}},{token:'fixture',fetchImpl:async()=>{calls++;return new Response('{}');}});assert.equal(calls,0);const row=(await db.query("SELECT * FROM line_deliveries WHERE id='expiry'")).rows[0];assert.equal(row.state,'expired');assert.equal(row.payload,null);}finally{await db.close();}
});
test('a still-running answer cannot be reclaimed inside its generation and transport budget',async()=>{
 const db=await setup();let release,entered;
 const ready=new Promise(r=>{entered=r;}),hold=new Promise(r=>{release=r;});let calls=0;
 try{await enqueueLine(db,raw('lease'));const first=deliverLine(db,{answer:async()=>{entered();await hold;return {answer:'answer',citations:[]};}},{token:'fixture',fetchImpl:async()=>{calls++;return new Response('{}');}});await ready;
  // A slow retrieval may outlive the LLM budget; no live token may be reclaimed.
  await db.query("UPDATE line_deliveries SET next_attempt_at=next_attempt_at-interval '46 seconds' WHERE id='lease'");
  const second=await deliverLine(db,{answer:async()=>({answer:'duplicate',citations:[]})},{token:'fixture',fetchImpl:async()=>{calls++;return new Response('{}');}});
  release();await first;assert.equal(second,false);assert.equal(calls,1);
 }finally{release?.();await db.close();}
});
test('terminal provider rejection erases transient visitor data immediately',async()=>{
 const db=await setup();try{await enqueueLine(db,raw('terminal'));await deliverLine(db,{answer:async()=>({answer:'answer',citations:[]})},{token:'fixture',fetchImpl:async()=>new Response('{}',{status:400})});const row=(await db.query("SELECT * FROM line_deliveries WHERE id='terminal'")).rows[0];assert.equal(row.state,'failed');assert.equal(row.payload,null);}finally{await db.close();}
});
test('long approved excerpt fallbacks fit LINE messages without clipping evidence URLs',async()=>{
 const db=await setup();let sent;
 try{await enqueueLine(db,raw('long'));const answer=('Approved excerpt '.repeat(290))+'\nhttps://github.com/example/repo/blob/main/README.md';await deliverLine(db,{answer:async()=>({answer,citations:[]})},{token:'fixture',fetchImpl:async(_url,options)=>{sent=JSON.parse(options.body);return new Response('{}');}});assert.ok(sent);assert.ok(sent.messages.every(m=>m.text.length<=5000));assert.equal(sent.messages.map(m=>m.text).join(''),answer);assert.match(sent.messages.at(-1).text,/https:\/\/github.com\/example\/repo\/blob\/main\/README.md$/);}finally{await db.close();}
});
test('rate limits retry at most three times and erase exhausted payloads',async()=>{
 const db=await setup();let calls=0;
 try{await enqueueLine(db,raw('retry'));const options={token:'fixture',fetchImpl:async()=>{calls++;return new Response('{}',{status:429});}},answers={answer:async()=>({answer:'answer',citations:[]})};
  for(let i=0;i<3;i++){assert.equal(await deliverLine(db,answers,options),true);await db.query("UPDATE line_deliveries SET next_attempt_at=now() WHERE id='retry'");}
  assert.equal(await deliverLine(db,answers,options),false);assert.equal(calls,3);const row=(await db.query("SELECT * FROM line_deliveries WHERE id='retry'")).rows[0];assert.equal(row.state,'failed');assert.equal(row.payload,null);
 }finally{await db.close();}
});
