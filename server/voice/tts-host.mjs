import http from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {normalizeSpeechWav,wrapSpeechPcm} from './tts.mjs';

export async function synthesizeWindows({text,language,signal}){
 if(process.platform!=='win32')throw Error('WINDOWS_REQUIRED');
 return new Promise((resolve,reject)=>{
  const child=spawn(process.env.VOICE_TTS_POWERSHELL||'pwsh.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','RemoteSigned','-File',fileURLToPath(new URL('../../scripts/synthesize-windows.ps1',import.meta.url))],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  const chunks=[];let size=0,invalid=false;
  const stop=()=>{invalid=true;child.kill();};signal?.addEventListener('abort',stop,{once:true});if(signal?.aborted)stop();
  child.stdout.on('data',chunk=>{size+=chunk.length;if(size>2*1024*1024)stop();else chunks.push(chunk);});
  child.stderr.resume();child.stdin.on('error',()=>{});child.on('error',()=>{signal?.removeEventListener('abort',stop);reject(Error('TTS_UNAVAILABLE'));});
  child.on('close',code=>{signal?.removeEventListener('abort',stop);if(code!==0||invalid)reject(Error('TTS_UNAVAILABLE'));else{try{resolve(wrapSpeechPcm(Buffer.concat(chunks)));}catch{reject(Error('TTS_UNAVAILABLE'));}}});
  child.stdin.end(JSON.stringify({text,language}),'utf8');
 });
}
export function createTtsHost({token,synthesize=synthesizeWindows}={}){
 if(!token||token.length<32)throw Error('INVALID_TTS_TOKEN');let busy=false;
 const hash=value=>createHash('sha256').update(value).digest();
 const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const fail=status=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'TTS_UNAVAILABLE'}));};
  if(req.url==='/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({service:'zuri-windows-tts',live:true}));return;}
  if(req.url!=='/speech'||req.method!=='POST')return fail(404);
  if(!timingSafeEqual(hash(String(req.headers.authorization||'')),hash(`Bearer ${token}`)))return fail(401);
  if(busy)return fail(503);
  if(req.headers['content-encoding']||!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return fail(415);
  busy=true;const abort=new AbortController();req.once('aborted',()=>abort.abort());res.once('close',()=>{if(!res.writableEnded)abort.abort();});const signal=AbortSignal.any([abort.signal,AbortSignal.timeout(6500)]);
  try{
   const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>8192)return fail(413);chunks.push(chunk);}
   let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return fail(400);}
   if(!input||Object.keys(input).some(k=>!['text','language'].includes(k))||!['th','en'].includes(input.language)||typeof input.text!=='string'||!input.text.trim()||input.text.length>800||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(input.text))return fail(400);
   const bytes=normalizeSpeechWav(await synthesize({...input,signal}));signal.throwIfAborted();res.writeHead(200,{'Content-Type':'audio/wav','Content-Length':bytes.length});res.end(bytes);
  }catch{if(!res.headersSent)fail(503);}finally{busy=false;}
 });server.requestTimeout=8000;server.headersTimeout=5000;return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){createTtsHost({token:process.env.VOICE_TTS_TOKEN}).listen(11436,'127.0.0.1',()=>console.log('Zuri Windows TTS listening on private loopback'));}
