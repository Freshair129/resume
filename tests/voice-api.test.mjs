import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/app.mjs';
import {AnswerService} from '../server/agent/answer.mjs';
import {wrapSpeechPcm,normalizeSpeechWav} from '../server/voice/tts.mjs';

const row={node_id:'1',chunk_id:'c1',source_id:'s1',generation:'g1',source_hash:'a',checksum:'a',text:'GenesisBlockDB uses native graph and vector search.',title:{en:'Genesis'},url:'https://github.com/Freshair129/GenesisBlock',project_slug:'genesisblock'};
async function serve(t,services){const app=createApp({store:{},config:{},...services});const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>{server.closeAllConnections();server.close();});return `http://127.0.0.1:${server.address().port}`;}
test('voice replies share approved evidence, keep proof off JSON, and suppress revoked text/audio after synthesis',async t=>{
 let published=true,speechCalls=0;
 const store={authorize:async()=>published?[{...row}]:[]},answers=new AnswerService(store,{search:async()=>({results:[row]})});
 const base=await serve(t,{store,answers,voice:{synthesize:async({text})=>{speechCalls++;assert.match(text,/native graph/);published=false;return {bytes:Buffer.alloc(100),mime_type:'audio/wav'};}}});
 const response=await fetch(base+'/api/voice/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'What is GenesisBlockDB?',lang:'en'})});
 assert.equal(response.status,409);assert.equal(speechCalls,1);const body=await response.json();assert.equal(body.audio,undefined);assert.equal(body.answer,undefined);
 const proofResult=await new AnswerService(store,{search:async()=>({results:[row]})}).answer('What is GenesisBlockDB?','en');assert.equal(JSON.stringify(proofResult).includes('node_id'),false);
});
test('voice reply binds only server-produced approved text to validated WAV, with citations outside the audio',async t=>{
 const answers=new AnswerService({authorize:async()=>[{...row}]},{search:async()=>({results:[row]})});
 const expected=wrapSpeechPcm(Buffer.alloc(48000));
 const base=await serve(t,{answers,voice:{synthesize:async({text,language})=>{assert.equal(text,'[1] '+row.text);assert.equal(language,'en');return {bytes:expected,mime_type:'audio/wav'};}}});
 const response=await fetch(base+'/api/voice/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'What is GenesisBlockDB?',lang:'en'})});
 const body=await response.json();assert.equal(response.status,200);assert.equal(body.audio_status,'available');assert.equal(body.citations[0].url,row.url);assert.deepEqual(normalizeSpeechWav(Buffer.from(body.audio.base64,'base64')),expected);assert.equal(body.proof,undefined);
});
test('voice text fallback returns citations with audio unavailable; invalid bodies never call model; no public arbitrary TTS',async t=>{
 const answers=new AnswerService({authorize:async()=>[{...row}]},{search:async()=>({results:[row]})});
 const base=await serve(t,{answers});
 const send=body=>fetch(base+'/api/voice/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const response=await send({message:'What is GenesisBlockDB?',lang:'en'});assert.equal(response.status,200);const body=await response.json();assert.equal(body.audio_status,'unavailable');assert.equal(body.citations.length,1);assert.equal(body.proof,undefined);
 assert.equal((await send({message:'hello',text:'arbitrary synthesis'})).status,400);
 assert.equal((await fetch(base+'/api/voice/synthesize',{method:'POST'})).status,404);
});
test('voice transcription rejects invalid audio/language before worker, and exposes missing worker honestly',async t=>{
 let calls=0;const base=await serve(t,{voice:{transcribe:async()=>{calls++;return {text:'hello',language:'en'};}}});
 const response=await fetch(base+'/api/voice/transcribe?lang=en',{method:'POST',headers:{'Content-Type':'audio/wav'},body:Buffer.from('not wav')});assert.equal(response.status,400);assert.equal(calls,0);
 assert.equal((await fetch(base+'/api/voice/transcribe?lang=auto',{method:'POST',headers:{'Content-Type':'audio/wav'},body:'x'})).status,400);
});
test('speech follows an explicit answer-language override instead of the microphone selector',async t=>{
 let spokenLanguage;
 const base=await serve(t,{answers:{answer:async()=>({answer:'ข้อมูลจากแหล่งอ้างอิง',citations:[{url:row.url}],confidence:'grounded_summary'}),reauthorize:async()=>true},voice:{synthesize:async({language})=>{spokenLanguage=language;throw Error('controlled unavailable');}}});
 for(const [message,lang,expected] of [['Explain GenesisBlockDB in Thai','en','th'],['อธิบาย GenesisBlockDB in English','th','en']]){const response=await fetch(base+'/api/voice/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,lang})});assert.equal(response.status,200);assert.equal(spokenLanguage,expected);}
});
