import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { KnowledgeStore } from '../server/knowledge/store.mjs';
const fixture={slug:'test-project',title:{en:'Test',th:'ทดสอบ'},summary:{en:'Fixture only',th:'ข้อมูลทดสอบ'},status:'prototype',category:'AI Automation',text:'Approved fixture evidence.',url:'https://github.com/Freshair129/resume/blob/152004c8e1b2830395251cd973f3d798e3995dca/README.md',sha:'152004c8e1b2830395251cd973f3d798e3995dca',path:'README.md'};
export async function setup(){const db=new PGlite();await db.exec(await readFile('postgres/migrations/001_knowledge.sql','utf8'));return {db,store:new KnowledgeStore(db),fixture};}
test('review cannot be retrieved, publication and outbox are atomic, revocation rejects stale hits',async()=>{
 const {db,store}=await setup(); try {
 const p=await store.ingest(fixture); assert.equal((await store.projects()).length,0);
 await assert.rejects(()=>store.publish(p.id,{model:'test',dimension:384}),/APPROVAL/);
 await store.approve(p.id); const gen=await store.publish(p.id,{model:'test',dimension:384});
 assert.equal((await store.projects()).length,0);
 assert.equal((await db.query('select * from knowledge_outbox')).rows.length,1);
 await db.query("update index_generations set state='verified' where id=$1",[gen.id]);
 const chunks=(await db.query('select * from kb_chunks')).rows;
 await db.query('insert into knowledge_index_records(generation_id,chunk_id,node_id,verified_at) values($1,$2,$3,now())',[gen.id,chunks[0].id,'native-node']);
 await store.activate(gen.id);
 assert.equal((await store.authorize(['native-node'])).length,1);
 await store.revoke(p.id); assert.deepEqual(await store.authorize(['native-node']),[]);
 assert.equal((await store.projects()).length,0);
 assert.equal((await db.query("select * from knowledge_outbox where operation='revoke'")).rows.length,1);
 assert.equal((await db.query("select * from pg_extension where extname='vector'")).rows.length,0);
 }finally{await db.close();}
});
test('private sources and secret-bearing candidates are rejected before storage',async()=>{
 const {db,store}=await setup(); try {await assert.rejects(()=>store.ingest({...fixture,text:'api_key=sk-123456789012345678901234567890'})); await assert.rejects(()=>store.ingest({...fixture,url:'http://127.0.0.1/secret'}));}finally{await db.close();}
});
