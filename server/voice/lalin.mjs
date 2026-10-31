import http from 'node:http';
import {createHash,randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {validateVoiceWav} from './wav.mjs';

export class LalinVoiceClient {
 constructor({socketPath=process.env.VOICE_WORKER_SOCKET,token=process.env.VOICE_WORKER_TOKEN,profileRevision=process.env.VOICE_WORKER_REVISION||'turbo-cpu4-v1',transport}={}){
  if(!socketPath?.startsWith('/')||!token||token.length<32)throw Error('INVALID_VOICE_CONFIG');
  if(!/^[a-zA-Z0-9_.-]{1,128}$/.test(profileRevision))throw Error('INVALID_VOICE_CONFIG');
  Object.assign(this,{socketPath,token,profileRevision,transport:transport||this.request.bind(this),busy:false});
 }
 async request(path,{method='GET',form,signal}={}){
  let body,contentType;
  if(form){const request=new Request('http://worker/',{method:'POST',body:form});body=Buffer.from(await request.arrayBuffer());contentType=request.headers.get('content-type');}
  return new Promise((resolve,reject)=>{
   const req=http.request({socketPath:this.socketPath,path,method,signal,headers:{Authorization:`Bearer ${this.token}`,Accept:'application/json',...(body?{'Content-Type':contentType,'Content-Length':body.length}:{})}},res=>{
    let size=0;const chunks=[];
    res.on('data',chunk=>{size+=chunk.length;if(size>65536)res.destroy(Error('VOICE_UNAVAILABLE'));else chunks.push(chunk);});
    res.on('error',reject);res.on('end',()=>{try{if(res.statusCode<200||res.statusCode>=300)throw Error('VOICE_UNAVAILABLE');resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(Error('VOICE_UNAVAILABLE'));}});
   });req.on('error',()=>reject(Error('VOICE_UNAVAILABLE')));req.end(body);
  });
 }
 async transcribe(bytes,language,{signal}={}){
  validateVoiceWav(bytes);
  if(!['th','en'].includes(language))throw Error('INVALID_LANGUAGE');
  if(this.busy)throw Error('VOICE_BUSY');
  this.busy=true;let attempt,submitted=false,success=false;
  const deadline=AbortSignal.timeout(20000),combined=signal?AbortSignal.any([signal,deadline]):deadline;
  try{
   combined.throwIfAborted();
   const description=await this.transport('/worker/v1/describe',{signal:combined});
   const profile=description.profiles?.find(x=>x.profile_id==='portfolio-asr'&&x.profile_revision===this.profileRevision&&x.kind==='asr');
   if(description.engine?.labeled_stub!==false||description.runtime_id!=='portfolio-asr'||description.physical_resource_id!=='portfolio-cpu'||!profile?.state?.ready||!profile.languages?.includes(language))throw Error('VOICE_UNAVAILABLE');
   attempt=randomUUID();const start=Date.now();
   const envelope={contract_version:'1.0',invocation_id:randomUUID(),attempt_id:attempt,kind:'asr',target:{runtime_id:description.runtime_id,runtime_epoch:description.runtime_epoch,physical_resource_id:description.physical_resource_id,profile_id:profile.profile_id,profile_revision:profile.profile_revision},admission:{lease_id:randomUUID(),start_before:new Date(start+3000).toISOString(),deadline_at:new Date(start+18000).toISOString()},input:{language,audio_sha256:createHash('sha256').update(bytes).digest('hex'),audio_bytes:bytes.length,declared_mime_type:'audio/wav'}};
   const form=new FormData();form.set('envelope',JSON.stringify(envelope));form.set('audio',new Blob([bytes],{type:'audio/wav'}),'question.wav');submitted=true;
   let status=await this.transport('/worker/v1/operations',{method:'POST',form,signal:combined});
   while(status.execution_status!=='FINISHED'&&status.execution_status!=='UNKNOWN'){
    await delay(150,undefined,{signal:combined});status=await this.transport(`/worker/v1/operations/${attempt}`,{signal:combined});
   }
   combined.throwIfAborted();
   if(status.operation_outcome!=='SUCCEEDED')throw Error(status.error?.code==='NO_SPEECH'?'NO_SPEECH':'VOICE_UNAVAILABLE');
   const text=status.result?.text;
   if(typeof text!=='string'||!text.trim()||text.length>2000||status.result.language!==language)throw Error('VOICE_UNAVAILABLE');
   success=true;return {text:text.trim(),language};
  }finally{
   if(submitted){
    if(!success)await this.transport(`/worker/v1/operations/${attempt}/cancel`,{method:'POST',signal:AbortSignal.timeout(1000)}).catch(()=>{});
    await this.transport(`/worker/v1/operations/${attempt}/payload`,{method:'DELETE',signal:AbortSignal.timeout(1000)}).catch(()=>{});
   }
   this.busy=false;
  }
 }
}
