// Run inside the API image with /checks and /evaluation mounts plus the private UDS.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LalinVoiceClient} from '/app/server/voice/lalin.mjs';
const manifest=JSON.parse(await readFile('/evaluation/inputs.json','utf8'));
const glossary=JSON.parse(process.env.ASR_EVAL_GLOSSARY||'[]');
const report={checked_at:new Date().toISOString(),scope:manifest.kind,glossary,runtimes:[],checks:[]};
const client=new LalinVoiceClient(),request=client.request.bind(client);
client.transport=async(path,options={})=>{
 if(options.form&&glossary.length){const envelope=JSON.parse(options.form.get('envelope'));envelope.input.glossary=glossary;options.form.set('envelope',JSON.stringify(envelope));}
 const value=await request(path,options);
 // Evaluation explicitly controls the prompt, independently of the deployed
 // adapter default. This never changes a worker's actual advertised state.
 if(path.endsWith('/describe')){
  if(!report.runtimes.some(x=>x.runtime_epoch===value.runtime_epoch))report.runtimes.push({observed_at:new Date().toISOString(),runtime_id:value.runtime_id,runtime_epoch:value.runtime_epoch,physical_resource_id:value.physical_resource_id,worker:value.worker,engine:value.engine,profiles:value.profiles});
  return {...value,capabilities:{...value.capabilities,asr_glossary:false}};
 }
 if(value.result)report.last_receipt={glossary_applied:value.result.glossary_applied??null};
 return value;
};
for(const item of manifest.cases){
 const bytes=await readFile(`/evaluation/${item.file}`);
 if(createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('FIXTURE_HASH_MISMATCH');
 const started=performance.now();delete report.last_receipt;
 try{const result=await client.transcribe(bytes,item.language);if(glossary.length&&report.last_receipt?.glossary_applied!==true)throw Error('GLOSSARY_NOT_APPLIED');report.checks.push({...item,...result,receipt:report.last_receipt,elapsed_ms:Math.round(performance.now()-started)});}
 catch(error){report.checks.push({...item,error:error.message,elapsed_ms:Math.round(performance.now()-started)});}
 await writeFile(`/evaluation/${process.env.ASR_EVAL_REPORT||'baseline.json'}`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.checks.at(-1)));
}
