import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
import {createPublicProxy,bridgeHeader} from '../server/public/proxy.mjs';
import {createBridgeServer} from '../server/public/bridge.mjs';
import {createApp} from '../server/app.mjs';
import {AnswerService} from '../server/agent/answer.mjs';
import {OllamaSummarizer} from '../server/adapters/ollama.mjs';
async function start(t,server){server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>{server.closeAllConnections();server.close();});return `http://127.0.0.1:${server.address().port}`;}
test('both public hops propagate client cancellation to upstream',async t=>{
 const abort=new AbortController();let reached;const received=new Promise(resolve=>{reached=resolve;});let propagated=false;
 const proxy=createPublicProxy({origin:'https://private.example',forwardToken:'a'.repeat(40),fetcher:async(_url,{signal})=>{reached();await new Promise(resolve=>signal.addEventListener('abort',()=>{propagated=true;resolve();},{once:true}));return Response.json({});}});
 const operation=proxy(new Request('https://web.example/api/voice/reply',{method:'POST',body:JSON.stringify({message:'Hello',lang:'en'}),headers:{'Content-Type':'application/json'},signal:abort.signal}));
 await received;abort.abort();await Promise.race([operation,delay(500)]);assert.equal(propagated,true);
 let upstreamReached,upstreamClosed;const started=new Promise(r=>upstreamReached=r),closed=new Promise(r=>upstreamClosed=r);
 const upstream=createServer((req,res)=>{upstreamReached();res.on('close',()=>upstreamClosed());});const origin=await start(t,upstream),token='b'.repeat(40),base=await start(t,createBridgeServer({origin,requiredToken:token}));
 const client=new AbortController();const pending=fetch(base+'/api/voice/transcribe?lang=en',{method:'POST',headers:{[bridgeHeader]:token,'Content-Type':'audio/wav'},body:Buffer.alloc(100),signal:client.signal}).catch(()=>{});
 await started;client.abort();assert.equal(await Promise.race([closed.then(()=>true),delay(800).then(()=>false)]),true);await pending;
});
test('voice cancellation closes actual Ollama HTTP generation and releases provider admission',async t=>{
 let entered,closed;const started=new Promise(r=>entered=r),stopped=new Promise(r=>closed=r);
 const base=await start(t,createServer((_req,res)=>{entered();res.on('close',closed);}));
 const llm=new OllamaSummarizer({baseUrl:base,model:'protocol-fixture'}),controller=new AbortController();
 const work=llm.summarize({question:'What is Genesis?',lang:'en',sources:[{id:'S1',title:'Source',text:'Genesis uses graph and vector search.'}]},{signal:controller.signal}).catch(e=>e.message);
 await started;controller.abort();assert.equal(await work,'MODEL_UNAVAILABLE');assert.equal(await Promise.race([stopped.then(()=>true),delay(500).then(()=>false)]),true);assert.equal(llm.busy,false);assert.equal(llm.failures,0,'A visitor cancellation is not a provider health failure.');
});
test('voice reply keeps admission until uncancellable retrieval settles after client abort',async t=>{
 let release,entered;const gate=new Promise(r=>release=r),started=new Promise(r=>entered=r);let count=0;
 const answers=new AnswerService({authorize:async()=>[]},{search:async()=>{count++;if(count===1){entered();await gate;}return {results:[]};}});
 const base=await start(t,createServer(createApp({store:{},answers}))),controller=new AbortController();
 const post=signal=>fetch(base+'/api/voice/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Hello',lang:'en'}),signal});
 const first=post(controller.signal).catch(()=>{});await started;controller.abort();await first;await delay(25);
 assert.equal((await post()).status,503);assert.equal(count,1);release();await delay(25);assert.equal((await post()).status,200);
});
