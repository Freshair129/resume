import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.mjs';

test('public JSON is compressed without changing content or no-store; authenticated responses are excluded',async()=>{
 const projects=Array.from({length:36},(_,i)=>({slug:`fixture-${i}`,summary:'Synthetic repeated public fixture content. '.repeat(30)}));
 const server=createApp({store:{projects:async()=>projects}}).listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));const url=`http://127.0.0.1:${server.address().port}/api/projects`;
 try{
  const compressed=await fetch(url,{headers:{'Accept-Encoding':'gzip'}});
  assert.equal(compressed.headers.get('content-encoding'),'gzip');assert.match(compressed.headers.get('vary'),/Accept-Encoding/i);
  assert.equal(compressed.headers.get('cache-control'),'no-store');assert.deepEqual(await compressed.json(),projects);
  const authenticated=await fetch(url,{headers:{'Accept-Encoding':'gzip',Authorization:'Bearer synthetic-request-only'}});
  assert.equal(authenticated.headers.get('content-encoding'),null);assert.deepEqual(await authenticated.json(),projects);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
