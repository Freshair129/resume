import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {createHash} from 'node:crypto';
import {WindowsTtsClient} from '../server/voice/tts.mjs';
import {encodeVoiceWav} from '../src/features/voice/pcm.mjs';
const dir='docs/evidence/voice/thai-asr';
await mkdir(`${dir}/fixtures`,{recursive:true});
const cases=JSON.parse(await readFile('tests/fixtures/voice-asr-evaluation.json','utf8'));
const config=parseEnv(await readFile('.runtime/voice-worker/api.env','utf8'));
const tts=new WindowsTtsClient({origin:'http://127.0.0.1:11436',token:config.VOICE_TTS_TOKEN,approved:true});
for(const item of cases){
 let bytes;
 if(item.original)bytes=await readFile(`.runtime/voice-worker/${item.original}`);
 else if(item.empty){const samples=new Float32Array(32000);let seed=123456789;if(item.empty==='noise')for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=(seed/0xffffffff-0.5)*0.04;}bytes=encodeVoiceWav(samples,16000);}
 else {const speech=await tts.synthesize({text:item.text,language:item.language}),pcm=speech.bytes.subarray(44),samples=new Float32Array(pcm.length/2);for(let i=0;i<samples.length;i++)samples[i]=pcm.readInt16LE(i*2)/32768;bytes=encodeVoiceWav(samples,24000);}
 item.sha256=createHash('sha256').update(bytes).digest('hex');item.file=`fixtures/${item.id}.wav`;
 await writeFile(`${dir}/${item.file}`,bytes);
}
await writeFile(`${dir}/inputs.json`,JSON.stringify({kind:'OS-synthesized speech and deterministic non-speech; not physical microphone',cases},null,2)+'\n');
console.log(`Prepared ${cases.length} public synthetic ASR fixtures`);
