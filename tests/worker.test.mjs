import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { KnowledgeStore } from '../server/knowledge/store.mjs';
import { indexOnce,reconcile } from '../server/workers/indexer.mjs';
import { randomUUID } from 'node:crypto';
test('replay after SQL activation completes outbox without rewriting native index; failed generations are revisited',async()=>{
 const db=new PGlite();try{await db.exec(await readFile('postgres/migrations/001_knowledge.sql','utf8'));const store=new KnowledgeStore(db);
 const p=await store.ingest({slug:'replay',title:{en:'Fixture',th:'ทดสอบ'},summary:{en:'Fixture',th:'ทดสอบ'},status:'prototype',category:'test',text:'Fixture',url:'https://github.com/Freshair129/resume/blob/152004c8e1b2830395251cd973f3d798e3995dca/README.md',sha:'152004c8e1b2830395251cd973f3d798e3995dca',path:'README.md'});await store.approve(p.id);const g=await store.publish(p.id,{model:'fixture',dimension:384});
 await db.query("UPDATE index_generations SET state='active' WHERE id=$1",[g.id]);await db.query('UPDATE publication_state SET active_generation=$1 WHERE project_id=$2',[g.id,p.id]);
 await indexOnce(store,{},{});assert.equal((await db.query('select state from knowledge_outbox')).rows[0].state,'done');
 await db.query("UPDATE index_generations SET state='failed' WHERE id=$1",[g.id]);let reached=false;const results=await reconcile(store,{assertQualified:async()=>({}),collections:async()=>{reached=true;throw new Error('offline');}});assert.equal(reached,true);assert.equal(results.length,1);assert.equal(results[0].state,'drift_or_unavailable');
 assert.equal((await store.projects()).length,0);
 }finally{await db.close();}
});

test('pending outbox owns its lease and reaches native qualification before any publication',async()=>{
 const db=new PGlite();try{await db.exec(await readFile('postgres/migrations/001_knowledge.sql','utf8'));const store=new KnowledgeStore(db);
 const p=await store.ingest({slug:'pending',title:{en:'Fixture',th:'ทดสอบ'},summary:{en:'Fixture',th:'ทดสอบ'},status:'prototype',category:'test',text:'Fixture',url:'https://github.com/Freshair129/resume/blob/152004c8e1b2830395251cd973f3d798e3995dca/README.md',sha:'152004c8e1b2830395251cd973f3d798e3995dca',path:'README.md'});await store.approve(p.id);await store.publish(p.id,{model:'fixture',dimension:384});
 let reached=false;await indexOnce(store,{assertQualified:async()=>{reached=true;throw new Error('offline');}},{model:'fixture',dimension:384});assert.equal(reached,true);assert.equal((await store.projects()).length,0);assert.equal((await db.query('select state from knowledge_outbox')).rows[0].state,'pending');
 }finally{await db.close();}
});

test('an unqualified engine leaves publication blocked before projecting any source',async()=>{
 const db=new PGlite();try{await db.exec(await readFile('postgres/migrations/001_knowledge.sql','utf8'));const store=new KnowledgeStore(db);
 const p=await store.ingest({slug:'unqualified',title:{en:'Fixture',th:'ทดสอบ'},summary:{en:'Fixture',th:'ทดสอบ'},status:'prototype',category:'test',text:'Fixture',url:'https://github.com/Freshair129/resume/blob/152004c8e1b2830395251cd973f3d798e3995dca/README.md',sha:'152004c8e1b2830395251cd973f3d798e3995dca',path:'README.md'});await store.approve(p.id);await store.publish(p.id,{model:'fixture',dimension:384});
 let writes=0;await indexOnce(store,{assertQualified:async()=>{throw Object.assign(new Error('Unqualified'),{code:'GENESIS_BUILD_UNQUALIFIED'});},createCollection:async()=>{writes++;}},{model:'fixture',dimension:384});
 assert.equal(writes,0);assert.deepEqual((await db.query('select state,error_code from knowledge_outbox')).rows,[{state:'blocked',error_code:'GENESIS_BUILD_UNQUALIFIED'}]);assert.deepEqual(await store.projects(),[]);
 }finally{await db.close();}
});
