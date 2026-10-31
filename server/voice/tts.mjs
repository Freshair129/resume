export function wrapSpeechPcm(input){
 const data=Buffer.from(input);if(!data.length||data.length%2||data.length>40*48000)throw Error('INVALID_SPEECH_OUTPUT');
 const b=Buffer.alloc(44+data.length);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(data.length,40);data.copy(b,44);return b;
}
export function normalizeSpeechWav(input){
 const b=Buffer.from(input);const invalid=()=>{throw Error('INVALID_SPEECH_OUTPUT');};
 if(b.length<46||b.length>2*1024*1024||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE'||b.readUInt32LE(4)!==b.length-8)invalid();
 let offset=12,format=false,data;
 while(offset+8<=b.length){
  const type=b.toString('ascii',offset,offset+4),size=b.readUInt32LE(offset+4),start=offset+8,end=start+size;if(end>b.length)invalid();
  if(type==='fmt '){if(format||![16,18].includes(size)||b.readUInt16LE(start)!==1||b.readUInt16LE(start+2)!==1||b.readUInt32LE(start+4)!==24000||b.readUInt32LE(start+8)!==48000||b.readUInt16LE(start+12)!==2||b.readUInt16LE(start+14)!==16||(size===18&&b.readUInt16LE(start+16)!==0))invalid();format=true;}
  else if(type==='data'){if(!format||data||!size||size%2||size/48000>40)invalid();data=b.subarray(start,end);}
  else invalid();offset=end+size%2;
 }
 if(offset!==b.length||!format||!data)invalid();
 const result=Buffer.alloc(44+data.length);result.write('RIFF');result.writeUInt32LE(result.length-8,4);result.write('WAVEfmt ',8);result.writeUInt32LE(16,16);result.writeUInt16LE(1,20);result.writeUInt16LE(1,22);result.writeUInt32LE(24000,24);result.writeUInt32LE(48000,28);result.writeUInt16LE(2,32);result.writeUInt16LE(16,34);result.write('data',36);result.writeUInt32LE(data.length,40);data.copy(result,44);return result;
}
export class WindowsTtsClient{
 constructor({origin=process.env.VOICE_TTS_ORIGIN,token=process.env.VOICE_TTS_TOKEN,approved=process.env.VOICE_TTS_APPROVED==='true'}={}){
  const url=new URL(origin);if(!approved||url.protocol!=='http:'||!['127.0.0.1','host.docker.internal'].includes(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash||!token||token.length<32)throw Error('INVALID_TTS_CONFIG');Object.assign(this,{origin:url.origin,token});
 }
 async synthesize({text,language,signal}){
  const spoken=text.replace(/\s*\[\d+\]/g,'').trim();
  if(!['th','en'].includes(language)||!spoken||spoken.length>800||/https?:\/\//i.test(spoken))throw Error('TTS_UNAVAILABLE');
  const deadline=AbortSignal.timeout(7500),combined=signal?AbortSignal.any([signal,deadline]):deadline;
  const response=await fetch(this.origin+'/speech',{method:'POST',headers:{Authorization:`Bearer ${this.token}`,'Content-Type':'application/json'},body:JSON.stringify({text:spoken,language}),signal:combined,redirect:'error',cache:'no-store'});
  if(!response.ok||!/^audio\/wav(?:;|$)/i.test(response.headers.get('content-type')||'')){await response.body?.cancel();throw Error('TTS_UNAVAILABLE');}
  let size=0;const chunks=[];for await(const part of response.body){size+=part.length;if(size>2*1024*1024){await response.body.cancel().catch(()=>{});throw Error('TTS_UNAVAILABLE');}chunks.push(part);}
  return {mime_type:'audio/wav',bytes:normalizeSpeechWav(Buffer.concat(chunks))};
 }
}
