export function encodeVoiceWav(samples,sampleRate){
 if(!samples.length||!Number.isFinite(sampleRate)||sampleRate<16000||samples.length/sampleRate>15)throw Error('INVALID_AUDIO');
 const length=Math.floor(samples.length*16000/sampleRate),buffer=new ArrayBuffer(44+length*2),view=new DataView(buffer);
 const text=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};
 text(0,'RIFF');view.setUint32(4,buffer.byteLength-8,true);text(8,'WAVEfmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,length*2,true);
 for(let i=0;i<length;i++){
  const begin=Math.floor(i*sampleRate/16000),end=Math.min(samples.length,Math.floor((i+1)*sampleRate/16000));let total=0;
  for(let j=begin;j<end;j++)total+=Number.isFinite(samples[j])?samples[j]:0;
  const value=Math.max(-1,Math.min(1,total/Math.max(1,end-begin)));view.setInt16(44+i*2,Math.round(value*(value<0?32768:32767)),true);
 }
 return new Uint8Array(buffer);
}
