import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createTtsHost} from '../server/voice/tts-host.mjs';
import {WindowsTtsClient,normalizeSpeechWav} from '../server/voice/tts.mjs';
function speech(){const b=Buffer.alloc(46+48000);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(18,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',38);b.writeUInt32LE(48000,42);return b;}
test('local speech output validates full PCM format, normalizes SAPI fmt18 and rejects corrupt/oversize WAV',()=>{
 const output=normalizeSpeechWav(speech());assert.equal(output.readUInt32LE(16),16);assert.equal(output.length,48044);
 for(const offset of [4,20,22,24,28,32,34]){const b=speech();b.writeUInt16LE(0,offset);assert.throws(()=>normalizeSpeechWav(b));}
 assert.throws(()=>normalizeSpeechWav(Buffer.alloc(2100000)));assert.throws(()=>normalizeSpeechWav(speech().subarray(0,80)));
});
test('private Windows TTS host authenticates, allowlists language/body, never redirects and synthesizes exact approved text',async t=>{
 const token='t'.repeat(64);let called=0;
 const server=createTtsHost({token,synthesize:async({text,language})=>{called++;assert.equal(text,'Approved answer.');assert.equal(language,'en');return speech();}});
 server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>{server.closeAllConnections();server.close();});const origin=`http://127.0.0.1:${server.address().port}`;
 const post=(body,authorized=true)=>fetch(origin+'/speech',{method:'POST',headers:{'Content-Type':'application/json',...(authorized?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 assert.equal((await post({text:'Approved answer.',language:'en'},false)).status,401);
 assert.equal((await post({text:'text',language:'th',voice:'anything'})).status,400);assert.equal(called,0);
 const client=new WindowsTtsClient({origin,token,approved:true});const result=await client.synthesize({text:'Approved answer. [1]',language:'en'});assert.equal(result.mime_type,'audio/wav');assert.equal(result.bytes.length,48044);assert.equal(called,1);
 assert.throws(()=>new WindowsTtsClient({origin:'https://untrusted.example',token,approved:true}));assert.throws(()=>new WindowsTtsClient({origin,token,approved:false}));
});
test('authenticated TTS cancellation reaches owned synthesis and releases host capacity',async t=>{
 let entered,cancelled,calls=0;const started=new Promise(r=>entered=r),stopped=new Promise(r=>cancelled=r);const token='u'.repeat(64);
 const server=createTtsHost({token,synthesize:async({signal})=>{calls++;if(calls>1)return speech();entered();await new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>{cancelled();reject(Error('CANCELLED'));},{once:true}));}});
 server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>{server.closeAllConnections();server.close();});const origin=`http://127.0.0.1:${server.address().port}`,controller=new AbortController();
 const client=new WindowsTtsClient({origin,token,approved:true}),work=client.synthesize({text:'Approved answer.',language:'en',signal:controller.signal}).catch(()=>{});await started;controller.abort();await stopped;await work;
 const result=await client.synthesize({text:'Approved answer.',language:'en'});assert.equal(result.bytes.length,48044);
});
