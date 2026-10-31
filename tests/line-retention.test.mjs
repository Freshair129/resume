import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { deliverLine } from '../server/adapters/line.mjs';
test('LINE retention purge runs with idle queue and no channel credentials',async()=>{
 const db=new PGlite();try{await db.exec(await readFile('postgres/migrations/001_knowledge.sql','utf8'));await db.query("INSERT INTO line_deliveries(id,payload,state,expires_at) VALUES('expired',$1,'failed',now()-interval '2 minutes')",[{message:'private visitor text',replyToken:'sensitive'}]);await deliverLine(db,{},{});assert.equal((await db.query("SELECT payload FROM line_deliveries WHERE id='expired'")).rows[0].payload,null);}finally{await db.close();}
});
