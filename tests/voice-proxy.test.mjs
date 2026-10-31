import test from 'node:test';
import assert from 'node:assert/strict';
import {createPublicProxy} from '../server/public/proxy.mjs';
test('voice proxy forwards only exact bounded voice endpoints and explicit input language',async()=>{
 let sent;const proxy=createPublicProxy({origin:'https://api.example',forwardToken:'x'.repeat(40),fetcher:async(url,options)=>{sent={url:url.href,options};return Response.json({text:'hello',language:'en'});}});
 const post=(path,body,type)=>proxy(new Request('https://web.example'+path,{method:'POST',headers:{'Content-Type':type,Authorization:'Bearer hostile',Cookie:'private=hostile'},body}));
 assert.equal((await post('/api/voice/transcribe?lang=en',Buffer.alloc(100),'audio/wav')).status,200);assert.equal(sent.url,'https://api.example/api/voice/transcribe?lang=en');assert.equal(sent.options.body.length,100);assert.equal(sent.options.headers.Authorization,undefined);
 assert.equal((await post('/api/voice/transcribe?lang=auto','x','audio/wav')).status,400);
 assert.equal((await post('/api/voice/transcribe?lang=th&path=/secret','x','audio/wav')).status,400);
 assert.equal((await post('/api/voice/transcribe?lang=th',Buffer.alloc(524289),'audio/wav')).status,400);
 assert.equal((await post('/api/voice/transcribe?lang=th','x','audio/webm')).status,415);
 assert.equal((await post('/api/voice/reply',JSON.stringify({message:'hello',lang:'en'}),'application/json')).status,200);
 for(const path of ['/api/voice/worker','/api/voice/tts','/worker/v1/describe','/api/voice/reply/extra'])assert.equal((await post(path,'{}','application/json')).status,404);
 assert.equal((await proxy(new Request('https://web.example/api/voice/reply'))).status,404);
});
