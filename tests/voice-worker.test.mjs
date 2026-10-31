import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVoiceWav } from '../server/voice/wav.mjs';
import { LalinVoiceClient } from '../server/voice/lalin.mjs';

export function wav(seconds=1) {
 const b=Buffer.alloc(44+seconds*32000); b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length-44,40);return b;
}
test('voice WAV accepts bounded PCM16 mono and rejects truncated, foreign format, extra bytes and duration overflow',()=>{
 assert.equal(validateVoiceWav(wav(15)).duration,15);
 for(const b of [Buffer.alloc(20),wav(16),Buffer.concat([wav(),Buffer.from('extra')]),wav().subarray(0,100)])assert.throws(()=>validateVoiceWav(b));
 for(const [offset,value] of [[20,3],[22,2],[24,48000],[28,0],[32,4],[34,8]]){const b=wav();b.writeUInt16LE(value,offset);assert.throws(()=>validateVoiceWav(b));}
 const empty=wav(0);assert.throws(()=>validateVoiceWav(empty));
});

const describe={runtime_id:'portfolio-asr',runtime_epoch:'epoch-one',physical_resource_id:'portfolio-cpu',engine:{labeled_stub:false},profiles:[{profile_id:'portfolio-asr',profile_revision:'turbo-cpu4-v1',kind:'asr',languages:['th','en'],state:{ready:true}}]};
test('Lalin adapter binds profile/epoch, bounded media hash and explicit language; erases successful payload',async()=>{
 const calls=[];let envelope;
 const transport=async(path,options={})=>{calls.push(path);if(path.endsWith('/describe'))return describe;if(path==='/worker/v1/operations'){envelope=JSON.parse(options.form.get('envelope'));assert.equal(options.form.get('audio').size,wav().length);return {execution_status:'RUNNING'};}if(options.method==='DELETE')return {};return {execution_status:'FINISHED',operation_outcome:'SUCCEEDED',result:{text:'GenesisBlockDB คืออะไร',language:'th'}};};
 const client=new LalinVoiceClient({socketPath:'/private/worker.sock',token:'s'.repeat(40),transport});
 assert.deepEqual(await client.transcribe(wav(),'th'),{text:'GenesisBlockDB คืออะไร',language:'th'});
 assert.equal(envelope.target.runtime_epoch,'epoch-one');assert.equal(envelope.target.profile_revision,'turbo-cpu4-v1');assert.equal(envelope.input.language,'th');assert.match(envelope.input.audio_sha256,/^[a-f0-9]{64}$/);assert.equal(calls.at(-1).endsWith('/payload'),true);
});
test('Lalin adapter rejects stub/mismatched profiles, reports silence, cancels failed/aborted attempts and erases',async()=>{
 for(const mode of ['stub','mismatch','silence','abort']){
  const calls=[];const controller=new AbortController();
  const transport=async(path,options={})=>{calls.push(path);if(path.endsWith('/describe'))return mode==='stub'?{...describe,engine:{labeled_stub:true}}:mode==='mismatch'?{...describe,profiles:[{...describe.profiles[0],profile_revision:'unknown'}]}:describe;if(path==='/worker/v1/operations'){if(mode==='abort'){controller.abort();throw new Error('ABORTED');}return {execution_status:'FINISHED',operation_outcome:'FAILED',error:{code:'NO_SPEECH'}};}return {};};
  const client=new LalinVoiceClient({socketPath:'/private/worker.sock',token:'s'.repeat(40),transport});
  await assert.rejects(client.transcribe(wav(),'th',{signal:controller.signal}),mode==='silence'?/NO_SPEECH/:/VOICE_UNAVAILABLE|ABORTED/);
  if(['silence','abort'].includes(mode)){assert.ok(calls.some(x=>x.endsWith('/cancel')));assert.ok(calls.at(-1).endsWith('/payload'));}else assert.equal(calls.length,1);
 }
});
