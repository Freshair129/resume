import {encodeVoiceWav} from './pcm.mjs';
export async function startCapture({signal,onLimit}={}){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia||!Context||!window.AudioWorkletNode)throw Error('UNSUPPORTED_CAPTURE');
 const context=new Context();let stream,source,recorder,timer,finished=false,total=0;const chunks=[];
 const cancel=()=>{finished=true;clearTimeout(timer);recorder?.disconnect();source?.disconnect();stream?.getTracks().forEach(track=>track.stop());void context.close().catch(()=>{});signal?.removeEventListener('abort',cancel);};
 try{
  signal?.throwIfAborted();signal?.addEventListener('abort',cancel,{once:true});
  await context.resume();signal?.throwIfAborted();
  stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false});
  if(finished||signal?.aborted){cancel();throw Error('CAPTURE_CANCELLED');}
  await context.audioWorklet.addModule(new URL('./recorder-worklet.js',import.meta.url));
  if(finished||signal?.aborted)throw Error('CAPTURE_CANCELLED');
  source=context.createMediaStreamSource(stream);recorder=new AudioWorkletNode(context,'zuri-recorder');
  recorder.port.onmessage=({data})=>{if(finished)return;const remaining=Math.floor(context.sampleRate*15)-total;if(remaining<=0)return;const chunk=data.slice(0,remaining);chunks.push(chunk);total+=chunk.length;};
  source.connect(recorder);recorder.connect(context.destination);
  timer=setTimeout(()=>onLimit?.(),15000);
  return {cancel,stop:async()=>{if(finished)throw Error('CAPTURE_CANCELLED');cancel();const pcm=new Float32Array(total);let offset=0;for(const chunk of chunks){pcm.set(chunk,offset);offset+=chunk.length;}return encodeVoiceWav(pcm,context.sampleRate);}};
 }catch(error){cancel();throw error;}
}
