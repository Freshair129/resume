import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {enqueueGithub} from '../server/adapters/github.mjs';
test('GitHub signed candidate delivery deduplicates and rejects private source',async()=>{
 const db=new PGlite();try{await db.exec(await readFile('postgres/migrations/001_knowledge.sql','utf8'));const raw=Buffer.from(JSON.stringify({repository:{full_name:'Freshair129/resume',private:false}})),secret='fixture-secret',sig='sha256='+createHmac('sha256',secret).update(raw).digest('hex');await assert.rejects(()=>enqueueGithub(db,raw,'bad','1',secret));await enqueueGithub(db,raw,sig,'1',secret);await enqueueGithub(db,raw,sig,'1',secret);assert.equal((await db.query('select count(*)::int n from ingestion_jobs')).rows[0].n,1);assert.equal((await db.query('select count(*)::int n from projects')).rows[0].n,0);const privateRaw=Buffer.from(JSON.stringify({repository:{full_name:'Freshair129/private',private:true}}));await assert.rejects(()=>enqueueGithub(db,privateRaw,'sha256='+createHmac('sha256',secret).update(privateRaw).digest('hex'),'2',secret));}finally{await db.close();}
});
