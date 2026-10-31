import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.mjs';
import { createHmac } from 'node:crypto';
import { setup } from './store.test.mjs';
test('API auth, input bounds, unpublished 404, LINE raw verification and dedupe',async()=>{
 const {db,store}=await setup();const app=createApp({store,genesis:{collections:async()=>[]},answers:{answer:async()=>({answer:'No evidence',citations:[],confidence:'none',suggested_questions:[]})},embeddings:{model:'fixture',dimension:384},config:{ownerToken:'o'.repeat(40),mcpToken:'m'.repeat(40),lineSecret:'fixture-secret',origin:'http://localhost'}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.equal((await fetch(base+'/api/admin/projects')).status,401);
  assert.equal((await fetch(base+'/api/projects/secret')).status,404);
  assert.equal((await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'x'.repeat(2001)})})).status,400);
  assert.equal((await fetch(base+'/api/webhooks/line',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})).status,401);
  const body=JSON.stringify({events:[{webhookEventId:'event-1',type:'message',replyToken:'reply',message:{type:'text',text:'hello'}}]});
  const signature=createHmac('sha256','fixture-secret').update(body).digest('base64');
  for(let i=0;i<2;i++)assert.equal((await fetch(base+'/api/webhooks/line',{method:'POST',headers:{'Content-Type':'application/json','x-line-signature':signature},body})).status,200);
  assert.equal((await db.query('select * from line_deliveries')).rows.length,1);
  assert.equal((await fetch(base+'/api/mcp/list_public_projects',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
 }finally{await new Promise(r=>server.close(r));await db.close();}
});

test('readiness checks live SQL, qualified engine and active native collection coverage',async()=>{
 let sqlUp=true,engineUp=true;
 const good={name:'public_g1',model:'bge',dim:1024,metric:'Cosine',count:2,index_lag:0,coverage:{state:'READY',validated:true,missing_count:0,extra_count:0,pending_count:0}};
 let collection={...good};
 const store={db:{query:async()=>{if(!sqlUp)throw new Error('private-connection-string');return {rows:[]};}},generations:async()=>[{collection:'public_g1',model:'bge',dimension:1024,expected_chunks:2,state:'active',revision:1,canonical_revision:1}]};
 const genesis={assertQualified:async()=>{if(!engineUp)throw new Error('private-upstream-token');return {};},collections:async()=>collection?[collection]:[]};
 const app=createApp({store,genesis,embeddings:{model:'bge',dimension:1024}});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/ready`;
 try{
  assert.equal((await fetch(url)).status,200);
  for(const bad of [null,{...good,dim:384},{...good,model:'other'},{...good,count:1},{...good,index_lag:1},{...good,coverage:{...good.coverage,validated:false}},{...good,coverage:{...good.coverage,missing_count:1}}]){
   collection=bad;const res=await fetch(url);assert.equal(res.status,503);assert.deepEqual(await res.json(),{ready:false});
  }
  collection={...good};engineUp=false;assert.equal((await fetch(url)).status,503);
  engineUp=true;sqlUp=false;assert.equal((await fetch(url)).status,503);
 }finally{await new Promise(r=>server.close(r));}
});
