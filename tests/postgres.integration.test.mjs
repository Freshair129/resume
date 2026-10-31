import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { KnowledgeStore } from '../server/knowledge/store.mjs';
test('native PostgreSQL migrations, rollback, RLS default deny, activation and offline revocation',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const db=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL});const schema='test_'+randomUUID().replaceAll('-','');const client=await db.connect();
 try{
  await client.query(`CREATE SCHEMA ${schema}`);await client.query(`SET search_path TO ${schema},public`);await client.query(await readFile('postgres/migrations/001_knowledge.sql','utf8'));
  const store=new KnowledgeStore({connect:async()=>({query:client.query.bind(client),release(){}}),query:client.query.bind(client)});
  const c={slug:'native-pg',title:{en:'Fixture',th:'ทดสอบ'},summary:{en:'Fixture',th:'ทดสอบ'},category:'test',status:'prototype',text:'Synthetic approval fixture only.',url:'https://github.com/Freshair129/resume/blob/152004c8e1b2830395251cd973f3d798e3995dca/README.md',sha:'152004c8e1b2830395251cd973f3d798e3995dca',path:'README.md'};
  const p=await store.ingest(c);await assert.rejects(()=>store.publish(p.id,{model:'test',dimension:384}));assert.equal((await client.query('select count(*)::int n from knowledge_outbox')).rows[0].n,0);
  await store.approve(p.id);const g=await store.publish(p.id,{model:'test',dimension:384});const chunk=(await client.query('select id from kb_chunks')).rows[0];
  await client.query("update index_generations set state='verified' where id=$1",[g.id]);await client.query('insert into knowledge_index_records values($1,$2,$3,now())',[g.id,chunk.id,'stale']);await store.activate(g.id);
  assert.equal((await store.authorize(['stale'])).length,1);await store.revoke(p.id);assert.equal((await store.authorize(['stale'])).length,0);
  assert.equal((await client.query("select count(*)::int n from pg_extension where extname='vector'")).rows[0].n,0);
  const role='reader_'+randomUUID().replaceAll('-','');await client.query(`CREATE ROLE ${role}`);try{await client.query(`GRANT USAGE ON SCHEMA ${schema} TO ${role}`);await client.query(`GRANT SELECT ON projects,source_documents,kb_chunks TO ${role}`);await client.query(`SET ROLE ${role}`);assert.deepEqual((await client.query('select * from source_documents')).rows,[]);await client.query('RESET ROLE');}finally{await client.query('RESET ROLE');await client.query(`DROP OWNED BY ${role}`);await client.query(`DROP ROLE ${role}`);}
 }finally{await client.query('SET search_path TO public');await client.query(`DROP SCHEMA ${schema} CASCADE`);client.release();await db.end();}
});
