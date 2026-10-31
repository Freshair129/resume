import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createBridgeServer } from '../server/public/bridge.mjs';
import { createPublicProxy } from '../server/public/proxy.mjs';

async function start(server){server.listen(0,'127.0.0.1');await once(server,'listening');return `http://127.0.0.1:${server.address().port}`;}
async function stop(server){server.closeAllConnections();await new Promise(r=>server.close(r));}

test('LINE bridge forwards exact signed bytes without visitor credentials, only at the webhook POST',async()=>{
 const seen=[];
 const upstream=createServer(async(req,res)=>{const chunks=[];for await(const c of req)chunks.push(c);seen.push({url:req.url,headers:req.headers,body:Buffer.concat(chunks)});res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':'secret=value'});res.end('{"accepted":true}');});
 const origin=await start(upstream),bridge=createBridgeServer({origin,requiredToken:'fixture-token-'.repeat(4)}),base=await start(bridge);
 try{
  const body='{ "events": [], "destination": "ภาษาไทย" }';
  const response=await fetch(base+'/api/webhooks/line?owner=true',{method:'POST',headers:{'content-type':'application/json','x-line-signature':'A'.repeat(43)+'=',authorization:'Bearer secret',cookie:'private=true','x-portfolio-bridge-token':'private'},body});
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{accepted:true});
  assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(seen[0].body.toString(),body);assert.equal(seen[0].url,'/api/webhooks/line');
  assert.equal(seen[0].headers['x-line-signature'],'A'.repeat(43)+'=');
  for(const key of ['authorization','cookie','x-portfolio-bridge-token'])assert.equal(seen[0].headers[key],undefined);
  for(const path of ['/api/webhooks/line','/api/webhooks/line/','/api/admin/projects'])assert.equal((await fetch(base+path)).status,404);
  assert.equal((await createPublicProxy({})(new Request('https://site.example/api/webhooks/line',{method:'POST',body:'{}'}))).status,404);
 }finally{await stop(bridge);await stop(upstream);}
});

test('LINE ingress rejects missing signatures, oversized bodies, encodings and upstream redirects',async()=>{
 let calls=0,mode='ok';
 const upstream=createServer((req,res)=>{calls++;req.resume();res.writeHead(mode==='redirect'?302:401,{'Content-Type':'application/json',Location:'https://example.invalid/'});res.end('{"error":"INVALID_SIGNATURE"}');});
 const origin=await start(upstream),bridge=createBridgeServer({origin,requiredToken:'fixture-token-'.repeat(4)}),base=await start(bridge);
 const post=(headers={},body='{}')=>fetch(base+'/api/webhooks/line',{method:'POST',headers:{'content-type':'application/json',...headers},body});
 try{
  assert.equal((await post()).status,401);
  const signature={'x-line-signature':'A'.repeat(43)+'='};
  assert.equal((await post({...signature,'content-encoding':'gzip'})).status,415);
  assert.equal((await post(signature,'x'.repeat(262145))).status,413);assert.equal(calls,0);
  assert.equal((await post(signature)).status,401);mode='redirect';assert.equal((await post(signature)).status,502);
 }finally{await stop(bridge);await stop(upstream);}
});
