import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeVoiceWav} from '../src/features/voice/pcm.mjs';
import {validateVoiceWav} from '../server/voice/wav.mjs';
test('browser PCM resamples to bounded mono 16 kHz, clips samples and produces valid WAV',()=>{
 const bytes=encodeVoiceWav(new Float32Array(48000).fill(2),48000);const b=Buffer.from(bytes);assert.equal(validateVoiceWav(b).duration,1);assert.equal(b.readInt16LE(44),32767);
 const negative=Buffer.from(encodeVoiceWav(new Float32Array(16000).fill(-2),16000));assert.equal(negative.readInt16LE(44),-32768);
 assert.throws(()=>encodeVoiceWav(new Float32Array(16000*16),16000));assert.throws(()=>encodeVoiceWav(new Float32Array(),48000));assert.throws(()=>encodeVoiceWav(new Float32Array(10),0));
 const alternate=new Float32Array(48000);for(let i=0;i<alternate.length;i++)alternate[i]=i%2?1:-1;assert.ok(Math.abs(Buffer.from(encodeVoiceWav(alternate,48000)).readInt16LE(44))<20000,'downsampling averages instead of taking one aliased sample');
});
