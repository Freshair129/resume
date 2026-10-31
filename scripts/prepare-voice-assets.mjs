import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {createReadStream,createWriteStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import {Readable} from 'node:stream';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),profile=JSON.parse(await readFile(resolve(root,process.argv[2]||'infra/voice-asr-profile.json'),'utf8')),source=profile._model_source||{repository:'mobiuslabsgmbh/faster-whisper-large-v3-turbo',revision:'main',cache_dir:'models'};
if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repository)||!(/^[a-f0-9]{40}$/.test(source.revision)||source.revision==='main')||!/^models(?:-[a-z0-9-]+)?$/.test(source.cache_dir))throw Error('INVALID_MODEL_SOURCE');
const directory=resolve(root,'.runtime/voice-worker',source.cache_dir);
await mkdir(directory,{recursive:true});
async function digest(path){try{const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');}catch{return null;}}
for(const asset of profile.assets){
 if(!/^[a-z_.]+$/.test(asset.role))throw Error('INVALID_ASSET');
 const origin=source.asset_sources?.[asset.role]||source;
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(origin.repository)||!(/^[a-f0-9]{40}$/.test(origin.revision)||origin.revision==='main'))throw Error('INVALID_ASSET_SOURCE');
 const target=resolve(directory,asset.role);
 if(await digest(target)===asset.sha256){console.log(`${asset.role}: verified cache`);continue;}
 const url=`https://huggingface.co/${origin.repository}/resolve/${origin.revision}/${asset.role}?download=true`;
 const response=await fetch(url,{signal:AbortSignal.timeout(900000)});if(!response.ok)throw Error(`MODEL_DOWNLOAD_FAILED_${response.status}`);
 await pipeline(Readable.fromWeb(response.body),createWriteStream(target+'.partial'));
 if(await digest(target+'.partial')!==asset.sha256)throw Error('ASSET_HASH_MISMATCH');
 await rename(target+'.partial',target);console.log(`${asset.role}: downloaded and verified`);
}
await writeFile(resolve(root,'.runtime/voice-worker/model-receipt.json'),JSON.stringify({model:source.repository,revision:source.revision,assets:profile.assets.map(({role,sha256})=>({role,sha256,source:source.asset_sources?.[role]||{repository:source.repository,revision:source.revision}}))},null,2)+'\n');
