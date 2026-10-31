import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {parseEnv} from 'node:util';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const base=resolve(import.meta.dirname,'../.runtime/voice-worker');await mkdir(base,{recursive:true});
let token;
try{token=parseEnv(await readFile(resolve(base,'api.env'),'utf8')).VOICE_WORKER_TOKEN;if(!/^[a-f0-9]{64}$/.test(token||''))throw Error('INVALID_EXISTING_VOICE_TOKEN');}catch(e){if(e.code!=='ENOENT')throw e;token=randomBytes(32).toString('hex');}
let ttsToken;try{ttsToken=parseEnv(await readFile(resolve(base,'tts.env'),'utf8')).VOICE_TTS_TOKEN;if(!/^[a-f0-9]{64}$/.test(ttsToken||''))throw Error('INVALID_EXISTING_TTS_TOKEN');}catch(e){if(e.code!=='ENOENT')throw e;ttsToken=randomBytes(32).toString('hex');}
const powershell=process.env.VOICE_TTS_POWERSHELL||spawnSync('where.exe',['pwsh.exe'],{encoding:'utf8',windowsHide:true}).stdout?.trim().split(/\r?\n/)[0];
if(!powershell)throw Error('POWERSHELL_7_REQUIRED');
await writeFile(resolve(base,'tts.env'),`VOICE_TTS_TOKEN=${ttsToken}\nVOICE_TTS_POWERSHELL=${JSON.stringify(powershell.replaceAll('\\','/'))}\n`,{mode:0o600});
// Public presets were explicitly selected by the owner on 2026-10-31.
await writeFile(resolve(base,'api.env'),`VOICE_WORKER_TOKEN=${token}\nVOICE_TTS_ORIGIN=http://host.docker.internal:11436\nVOICE_TTS_TOKEN=${ttsToken}\nVOICE_TTS_APPROVED=true\n`,{mode:0o600});
await writeFile(resolve(base,'worker.env'),`LALIN_VOICE_WORKER_INFERENCE_CREDENTIALS=${JSON.stringify({portfolio:token})}\n`,{mode:0o600});
console.log('Dedicated private worker credentials configured; values omitted.');
