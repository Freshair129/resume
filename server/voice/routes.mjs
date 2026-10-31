import express from 'express';
import {rateLimit} from 'express-rate-limit';
import {z} from 'zod';
import {validateVoiceWav} from './wav.mjs';
import {normalizeSpeechWav} from './tts.mjs';
import {answerLanguage} from '../agent/grounding.mjs';
const question=z.object({message:z.string().trim().min(1).max(2000),lang:z.enum(['th','en'])}).strict();
function requestSignal(req,res,timeout){
 const abort=new AbortController();req.once('aborted',()=>abort.abort());res.once('close',()=>{if(!res.writableEnded)abort.abort();});
 return AbortSignal.any([abort.signal,AbortSignal.timeout(timeout)]);
}
async function bounded(promise,signal){
 signal.throwIfAborted();let reject;
 const stopped=new Promise((_,no)=>{reject=()=>no(Error('VOICE_UNAVAILABLE'));signal.addEventListener('abort',reject,{once:true});});
 try{return await Promise.race([promise,stopped]);}finally{signal.removeEventListener('abort',reject);}
}
export function mountVoiceRoutes(app,{answers,voice}){
 // With the private bridge this is deliberately an aggregate ceiling. Untrusted
 // forwarded IP headers never create additional quota or authorization.
 app.use('/api/voice',rateLimit({windowMs:60000,limit:15,standardHeaders:'draft-8',legacyHeaders:false}));
 let replying=false;
 app.post('/api/voice/transcribe',(req,res,next)=>{
  if(Object.keys(req.query).length!==1||!['th','en'].includes(req.query.lang))return res.status(400).json({error:'INVALID_LANGUAGE'});
  if(req.headers['content-encoding']||!/^audio\/wav(?:;|$)/i.test(req.headers['content-type']||''))return res.status(415).json({error:'WAV_REQUIRED'});
  next();
 },express.raw({type:'audio/wav',limit:'512kb',inflate:false}),async(req,res)=>{
  try{validateVoiceWav(req.body);}catch{return res.status(400).json({error:'INVALID_AUDIO'});}
  if(!voice?.transcribe)return res.status(503).json({error:'VOICE_UNAVAILABLE'});
  try{res.json(await voice.transcribe(req.body,req.query.lang,{signal:requestSignal(req,res,22000)}));}
  catch(error){res.status(error.message==='NO_SPEECH'?422:503).json({error:error.message==='NO_SPEECH'?'NO_SPEECH':'VOICE_UNAVAILABLE'});}
 });
 app.post('/api/voice/reply',express.json({limit:'16kb'}),async(req,res)=>{
  const parsed=question.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'INVALID_REQUEST'});
  if(replying)return res.status(503).json({error:'VOICE_BUSY'});
  replying=true;const signal=requestSignal(req,res,23000);const pending=[];
  try{
   const work=answers.answer(parsed.data.message,parsed.data.lang,{signal});pending.push(work);
   const result=await bounded(work,signal);
   let audio;
   // Only a server-configured qualified provider can supply speech. Client input
   // never selects a voice, model or arbitrary synthesis text.
   if(voice?.synthesize&&(result.citations?.length||result.confidence==='none')){
    if(!await bounded(answers.reauthorize(result),signal))return res.status(409).json({error:'PUBLICATION_CHANGED'});
    const audioSignal=AbortSignal.any([signal,AbortSignal.timeout(8000)]);
    try{const work=voice.synthesize({text:result.answer,language:answerLanguage(parsed.data.message,parsed.data.lang),signal:audioSignal});pending.push(work);audio=await bounded(work,audioSignal);}catch{/* approved text remains usable */}
   }
   if(!await bounded(answers.reauthorize(result),signal))return res.status(409).json({error:'PUBLICATION_CHANGED'});
   signal.throwIfAborted();
   if(audio){try{if(audio.mime_type!=='audio/wav')throw Error('INVALID_AUDIO');audio={mime_type:'audio/wav',bytes:normalizeSpeechWav(audio.bytes)};}catch{audio=undefined;}}
   res.json({...result,audio_status:audio?'available':'unavailable',...(audio?{audio:{mime_type:'audio/wav',base64:audio.bytes.toString('base64')}}:{})});
  }catch{if(!res.headersSent)res.status(503).json({error:'VOICE_UNAVAILABLE'});}
  finally{await Promise.allSettled(pending);replying=false;}
 });
}
