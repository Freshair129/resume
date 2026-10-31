import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {normalizeSpeechWav} from '../server/voice/tts.mjs';
const base=process.env.VOICE_CHECK_URL||'http://127.0.0.1:3103',path=process.env.VOICE_CHECK_REPORT||'docs/evidence/voice/candidate-api.json';
const report={checked_at:new Date().toISOString(),base,fixtures:'Windows SAPI synthetic input, no real microphone',answer_input:process.env.VOICE_USE_TRANSCRIPT==='1'?'Unedited ASR transcript':'Manually corrected question',checks:[]};
async function post(route,body,type='application/json'){
 const start=performance.now(),r=await fetch(base+route,{method:'POST',headers:{'Content-Type':type},body:type==='application/json'?JSON.stringify(body):body,signal:AbortSignal.timeout(28000)});
 const value=await r.json(),saved=structuredClone(value);
 if(saved.audio?.base64){const bytes=normalizeSpeechWav(Buffer.from(saved.audio.base64,'base64'));saved.audio={mime_type:'audio/wav',bytes:bytes.length,duration_seconds:(bytes.length-44)/48000,sha256:createHash('sha256').update(bytes).digest('hex')};}
 report.checks.push({route,status:r.status,elapsed_ms:Math.round(performance.now()-start),result:saved});await writeFile(path,JSON.stringify(report,null,2)+'\n');return {r,value};
}
for(const language of ['th','en']){
 const wav=await readFile(`.runtime/voice-worker/question-${language}.wav`),asr=await post(`/api/voice/transcribe?lang=${language}`,wav,'audio/wav');assert.equal(asr.r.status,200);assert.equal(asr.value.language,language);assert.ok(asr.value.text.length);
 // The page deliberately lets the visitor edit technical names before sending.
 const message=process.env.VOICE_USE_TRANSCRIPT==='1'?asr.value.text:language==='th'?'GenesisBlockDB รองรับการค้นหาแบบไหนบ้าง':'What is GenesisBlockDB?';
 const reply=await post('/api/voice/reply',{message,lang:language});assert.equal(reply.r.status,200);assert.ok(reply.value.citations.length);assert.ok(reply.value.citations.every(x=>/^https:\/\/github.com\/Freshair129\//.test(x.url)));assert.equal(reply.value.proof,undefined);
 if(process.env.VOICE_REQUIRE_AUDIO==='1'){assert.equal(reply.value.confidence,'grounded_summary');assert.equal(reply.value.audio_status,'available');const bytes=normalizeSpeechWav(Buffer.from(reply.value.audio.base64,'base64'));assert.ok(bytes.length>4800);}
}
const refusal=await post('/api/voice/reply',{message:'What is the owner salary?',lang:'en'});assert.equal(refusal.r.status,200);assert.equal(refusal.value.citations.length,0);assert.equal(refusal.value.confidence,'none');
const invalid=await post('/api/voice/transcribe?lang=en',Buffer.alloc(100),'audio/wav');assert.equal(invalid.r.status,400);
report.result=process.env.VOICE_REQUIRE_AUDIO==='1'?'PASS_WITH_NATIVE_LOCAL_TTS':'PASS_TEXT_AND_ASR';await writeFile(path,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,checks:report.checks.length}));
